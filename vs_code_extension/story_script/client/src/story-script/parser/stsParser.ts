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
	const untilSeparator = psUtils.readUntilSeparator(state);
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
	
	if (!itemMarkResult) {
		return undefined;
	}

	const itemNameIndex = itemMarkIndex + itemMarkResult.length;

	const inResult = psUtils.readUntil(state, /:/, undefined, itemNameIndex);

	if (!inResult) {
		return undefined;
	}

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
	state = skipCommentBlock(state) || state;

	state = parseItemType(state) || state;

	return state;
}

const parseItemType = (state: IParserState): IParserState => {
	state = skipCommentBlock(state) || state;

	const itResult = psUtils.readUntilSeparator(state);

	if (!itResult) {
		return undefined;
	}

	const itemTypeToken: ICodeToken = {
		type: CodeTokenType.ItemType,
		position: {...state.cursor},
		value: itResult,
	};

	state = psUtils.addToken(state, itemTypeToken);
	state = psUtils.skipSymbols(state, itResult.length);
	state = skipCommentBlock(state) || state;

	const dotResult = parseDot(state);
	if (dotResult) {
		state = dotResult;
		state = parseItemType(state) || state;
	}

	state = parseFunctionSignature(state) || state;

	return state;
}

const parseFunctionSignature = (state: IParserState): IParserState => {
	
	state = parseParenOpen(state);
	if (!state) {
		return undefined;
	}

	let paramState = parseFsParam(state);
	while (paramState) {
		state = paramState;
		state = psUtils.skipEmptySymbols(state);

		const commaResult = parseComma(state);
		if (!commaResult) {
			break;
		}

		state = commaResult;
		state = psUtils.skipEmptySymbols(state);

		paramState = parseFsParam(state);
	}

	const pcResult = parseParenClose(state);
	if (pcResult) {
		state = pcResult;
		state = psUtils.skipEmptySymbols(state);
	}

	return state;
}

const parseFsParam = (state: IParserState): IParserState => {
	state = parseParamName(state);
	
	if (!state) {
		return undefined;
	}

	state = psUtils.skipEmptySymbols(state);

	if (parseComma(state) || parseParenClose(state)) {
		// this param is over and it's hasn't type
		return state;
	}

	const colonResult = parseColon(state);
	if (!colonResult) {
		return state;
	}

	state = colonResult;
	state = parseParamType(state) || state;

	return state;
}

const parseParamName = (state: IParserState): IParserState => {
	const pnResult = psUtils.readUntilSeparator(state);

	if (!pnResult) {
		return undefined;
	}

	const paramNameToken: ICodeToken = {
		type: CodeTokenType.ParamName,
		position: { ...state.cursor },
		value: pnResult,
	};

	state = psUtils.addToken(state, paramNameToken);
	state = psUtils.skipSymbols(state, pnResult.length);
	state = psUtils.skipEmptySymbols(state);

	return state;
}

const parseParamType = (state: IParserState): IParserState => {
	state = psUtils.skipEmptySymbols(state);
	const ptResult = psUtils.readUntilSeparator(state);

	if (!ptResult) {
		return undefined;
	}

	const paramTypeToken: ICodeToken = {
		type: CodeTokenType.ParamType,
		position: { ...state.cursor },
		value: ptResult,
	};

	state = psUtils.addToken(state, paramTypeToken);
	state = psUtils.skipSymbols(state, ptResult.length);
	state = psUtils.skipEmptySymbols(state);

	if (parseParenClose(state) || parseComma(state)) {
		return state;
	}

	const dotResult = parseDot(state);
	if (dotResult) {
		state = dotResult;

		state = parseParamType(state) || state;
		return state;
	}

	const poResult = parseParenOpen(state);
	if (poResult) {
		state = parseFunctionSignature(state);
		return state;
	}

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
		const refName = psUtils.readUntilSeparator(state, undefined, refNameIndex);
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
				const subrefName = psUtils.readUntilSeparator(state, undefined, subrefNameIndex);
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

const parseParenOpen = (state: IParserState): IParserState => {
	const opResult = psUtils.readNext(state, new RegExp(/\(/));

	if (!opResult) {
		return undefined;
	}

	const openParenToken: ICodeToken = {
		type: CodeTokenType.ParenOpen,
		position: { ...state.cursor },
		value: opResult
	};

	state = psUtils.addToken(state, openParenToken);
	state = psUtils.skipSymbols(state, opResult.length);

	return state;
}
const parseParenClose = (state: IParserState): IParserState => {
	const cpResult = psUtils.readNext(state, new RegExp(/\)/));

	if (!cpResult) {
		return undefined;
	}

	const closeParenToken: ICodeToken = {
		type: CodeTokenType.ParenClose,
		position: { ...state.cursor },
		value: cpResult
	};

	state = psUtils.addToken(state, closeParenToken);
	state = psUtils.skipSymbols(state, cpResult.length);

	return state;
}
const parseColon = (state: IParserState): IParserState => {
	const colonResult = psUtils.readNext(state, new RegExp(/:/));

	if (!colonResult) {
		return undefined;
	}

	const colonToken: ICodeToken = {
		type: CodeTokenType.Colon,
		position: { ...state.cursor },
		value: colonResult
	};

	state = psUtils.addToken(state, colonToken);
	state = psUtils.skipSymbols(state, colonResult.length);

	return state;
}
const parseComma = (state: IParserState): IParserState => {
	const commaResult = psUtils.readNext(state, new RegExp(/,/));

	if (!commaResult) {
		return undefined;
	}

	const commaToken: ICodeToken = {
		type: CodeTokenType.Comma,
		position: { ...state.cursor },
		value: commaResult
	};

	state = psUtils.addToken(state, commaToken);
	state = psUtils.skipSymbols(state, commaResult.length);

	return state;
}
const parseStar = (state: IParserState): IParserState => {
	const starResult = psUtils.readNext(state, new RegExp(/\*/));

	if (!starResult) {
		return undefined;
	}

	const starToken: ICodeToken = {
		type: CodeTokenType.Star,
		position: { ...state.cursor },
		value: starResult
	};

	state = psUtils.addToken(state, starToken);
	state = psUtils.skipSymbols(state, starResult.length);

	return state;
}
const parseDot = (state: IParserState): IParserState => {
	const dotResult = psUtils.readNext(state, new RegExp(/\./));

	if (!dotResult) {
		return undefined;
	}

	const dotToken: ICodeToken = {
		type: CodeTokenType.Dot,
		position: { ...state.cursor },
		value: dotResult
	};

	state = psUtils.addToken(state, dotToken);
	state = psUtils.skipSymbols(state, dotResult.length);

	return state;
}