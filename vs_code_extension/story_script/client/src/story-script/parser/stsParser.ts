import { ICodeToken, CodeTokenType, ITokenItem, ITokenLiteral } from "../api/ICodeToken";
import { psUtils } from "./psUtils";
import { IParserState } from "./IParserState";
import * as vscode from 'vscode';

export const parseStoryScript = (sourceCode: string) => {
	const parserState: IParserState = {
		sourceCode,
		tokens: [],
		cursor: {line: 0, symbol: 0},
		lines: sourceCode.split(/\r?\n/g),
	}	

	let state = parserState;

	const separator = psUtils.readSeparator(state);
	const untilSeparator = psUtils.readUtilSeparator(state);
	const endBlock = psUtils.readUntilMultiline(state, /\*\//)

	while (!psUtils.isEndOfFile(state)) {
		state = parseNext(state) || state;
	}

	return state;
}

const parseNext = (state: IParserState): IParserState => {
	if (psUtils.isEndOfFile(state)) {
		return undefined;
	}

	//endline
	if (psUtils.isEndOfLine(state)) {
		state = addEndlineToken(state) || state;
		state = psUtils.setCursor(state, state.cursor.line + 1, 0);		
		return state;
	}

	//comment block
	const cbResult = skipCommentBlock(state);
	if (cbResult) {
		return cbResult;
	}

	//comment line
	const clResult = skipCommentLine(state);
	if (clResult) {
		return clResult;
	}

	//namespace
	const nsResult = parseNamespace(state);
	if (nsResult) {
		return nsResult;
	}

	//item line
	const ilResult = parseItemLine(state);
	if (ilResult) {
		return ilResult;
	}

	//and finally literal
	const lResult = parseLiteral(state);
	if (lResult) {
		return lResult;
	}

	state = psUtils.setCursorAtLineEnd(state);
	return state;
}

const skipCommentBlock = (state: IParserState): IParserState => {
	const blockStartText = psUtils.readNext(state, /\/\*/);
	
	if (blockStartText) {
		const blockEndSearch = psUtils.findNextMultiline(state, /\*\//);
	
		if (!blockEndSearch) {
			//everything is comment until
			const endFilePos = psUtils.getEndFilePos(state);
			state = psUtils.setCursor(state, endFilePos.line, endFilePos.symbol);
			return state;
		}

		//we know where closing tag is
		state = psUtils.setCursor(state, blockEndSearch.position.line, blockEndSearch.position.symbol + blockEndSearch.searchResult.length);
		return state;
	}

	return undefined;
}

const skipCommentLine = (state: IParserState): IParserState => {
	const blockStartText = psUtils.readNext(state, /\/\//);

	if (blockStartText) {
		state = psUtils.setCursorAtLineEnd(state);
		return state;
	}

	return undefined;
}

const addEndlineToken = (state: IParserState): IParserState => {
	const endLinePos = psUtils.getEndLinePos(state);
	if (!endLinePos) {
		return undefined;
	}

	const token: ICodeToken = {
		type: CodeTokenType.Endline,
		position: endLinePos,
	}

	state = {
		...state,
		tokens: [
			...state.tokens,
			token,
		]
	};

	return state;
}

const parseNamespace = (state: IParserState): IParserState => {
	if (state.cursor.symbol !== 0) {
		return undefined;
	}

	const startResult = psUtils.readNext(state, /^- /);
	if (startResult) {
		const nsResult = psUtils.readUntil(state, / -/, undefined, 2);
		if (nsResult) {
			const openToken: ICodeToken = {
				type: CodeTokenType.NsMark,
				position: {
					line: state.cursor.line,
					symbol: 0,
				},
				value: startResult
			}
			
			const closeToken: ICodeToken = {
				type: CodeTokenType.NsMark,
				position: {
					line: state.cursor.line,
					symbol: 2 + nsResult.length + 1,
				},
				value: ' -'
			}

			const nsToken: ICodeToken = {
				type: CodeTokenType.Namespace,
				position: {
					line: state.cursor.line,
					symbol: 2,
				},
				value: nsResult
			};

			state = {
				...state,
				tokens: [
					...state.tokens,
					openToken,
					nsToken,
					closeToken,
				]
			}

			const endLinePos = psUtils.getEndLinePos(state);
			state = psUtils.setCursor(state, endLinePos.line, endLinePos.symbol);

			return state;
		}
	}

	return undefined;
}

const parseItemLine = (state: IParserState): IParserState => {
	if (state.cursor.symbol !== 0) {
		return undefined;
	}

	const str = psUtils.getLineText(state);

	const whitespace = psUtils.readNext(state, /^\s*/) || '';
	const itemMarkIndex = whitespace.length;
	const itemMarkResult = psUtils.readNext(state, /\* /, undefined, itemMarkIndex);
	
	if (itemMarkResult) {
		const itemNameIndex = itemMarkIndex + itemMarkResult.length;

		const inResult = psUtils.readUntil(state, /:/, undefined, itemNameIndex);
		if (inResult) {
			const colonIndex = itemNameIndex + inResult.length;
			
			const itemMarkToken: ICodeToken = {
				type: CodeTokenType.Item,
				position: {
					line: state.cursor.line,
					symbol: itemMarkIndex,
				},
				value: itemMarkResult
			};
			const itemNameToken: ICodeToken = {
				type: CodeTokenType.ItemName,
				position: {
					line: state.cursor.line,
					symbol: itemNameIndex,
				},
				value: inResult
			};
			const colonToken: ICodeToken = {
				type: CodeTokenType.Colon,
				position: {
					line: state.cursor.line,
					symbol: colonIndex,
				},
				value: ': '
			};
			const whitespaceToken: ICodeToken = {
				type: CodeTokenType.Whitespace,
				position: {
					line: state.cursor.line,
					symbol: 0,
				},
				value: whitespace
			};

			state = {
				...state,
				tokens: [
					...state.tokens,
					whitespaceToken,
					itemMarkToken,
					itemNameToken,
					colonToken,
				]
			};
			state = psUtils.skipSymbols(state, colonIndex + 2);

			state = parseItemType(state) || state;
			return state;
		}
	}

	return undefined;
}

const parseItemType = (state: IParserState): IParserState => {
	const pattern = psUtils.combinePatterns(['\\*', ',', ';', '\\/\\/', '$'])
	const itResult = psUtils.readUntil(state, new RegExp(pattern));

	if (!itResult) {
		return undefined;
	}

	const itemTypeToken: ICodeToken = {
		type: CodeTokenType.ItemType,
		position: {...state.cursor},
		value: itResult,
	};

	state = {
		...state,
		tokens: [
			...state.tokens,
			itemTypeToken,
		]
	}

	const endLinePos = psUtils.getEndLinePos(state);
	state = psUtils.setCursor(state, endLinePos.line, endLinePos.symbol);

	return state;
}

const parseLiteral = (state: IParserState): IParserState => {
	const mentionResult = parseMention(state);
	if (mentionResult) {
		return mentionResult;
	}

	const pattern = /(\/\/)|(\/\*)|(\*)|($)/
	const lResult = psUtils.readUntil(state, pattern);

	if (lResult) {
		const literalToken: ICodeToken = {
			type: CodeTokenType.Literal,
			position: {
				line: state.cursor.line,
				symbol: state.cursor.symbol,
			},
			value: lResult
		}

		state = {
			...state,
			tokens: [
				...state.tokens,
				literalToken,
			]
		};

		state = psUtils.skipSymbols(state, lResult.length);
		return state;
	}

	return undefined;
}

const parseMention = (state: IParserState): IParserState => {
	const mMark = psUtils.readNext(state, /\*/);
	const line = state.cursor.line;
	const mentionMarkIndex = state.cursor.symbol;
	const refNameIndex = mentionMarkIndex + 1;

	if (mMark) {
		const refName = psUtils.readUtilSeparator(state, undefined, refNameIndex);
		if (refName) {
			const mMarkToken: ICodeToken = {
				type: CodeTokenType.Mention,
				position: {
					line,
					symbol: mentionMarkIndex
				},
				value: mMark,
			};

			const refNameToken: ICodeToken = {
				type: CodeTokenType.Text,
				position: {
					line,
					symbol: refNameIndex
				},
				value: refName
			};

			state = {
				...state,
				tokens: [
					...state.tokens,
					mMarkToken,
					refNameToken
				]
			};

			state = psUtils.skipSymbols(state, mMark.length + refName.length);

			while (psUtils.readNext(state, /\./)) {
				const subrefNameIndex = state.cursor.symbol + 1;
				const subrefName = psUtils.readUtilSeparator(state, undefined, subrefNameIndex);
				if (subrefName) {
					const dotToken: ICodeToken = {
						type: CodeTokenType.Dot,
						position: {
							line,
							symbol: state.cursor.symbol
						},
						value: '.'
					};

					const subrefNameToken: ICodeToken = {
						type: CodeTokenType.Text,
						position: {
							line,
							symbol: subrefNameIndex
						},
						value: subrefName
					};

					state = {
						...state,
						tokens: [
							...state.tokens,
							dotToken,
							subrefNameToken,
						]
					};

					state = psUtils.skipSymbols(state, 1 + subrefName.length);
				}
			}

			return state;
		}
	}

	return undefined;
}