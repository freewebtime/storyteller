import { ICodeToken, CodeTokenType, ITokenItem, ITokenLiteral } from "../api/ICodeToken";
import { psUtils } from "./psUtils";
import { IParserState } from "./IParserState";
import { isNullOrUndefined } from "util";

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

		const inResult = psUtils.readUntil(state, /: /, undefined, itemNameIndex);
		if (inResult) {
			const colonIndex = itemNameIndex + inResult.length;
			const itemTypeIndex = colonIndex + 2;

			const itResult = psUtils.readUntil(state, /[\*,; $]/, undefined, itemTypeIndex);
			if (itResult) {
				const itemMarkToken: ICodeToken = {
					type: CodeTokenType.Item,
					position: {
						line: state.cursor.line,
						symbol: itemMarkIndex,
					},
					value: itemMarkResult
				}
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
				}
				const itemTypeToken: ICodeToken = {
					type: CodeTokenType.ItemType,
					position: {
						line: state.cursor.line,
						symbol: itemTypeIndex,
					},
					value: itResult,
				}

				state = {
					...state,
					tokens: [
						...state.tokens,
						itemMarkToken,
						itemNameToken,
						colonToken,
						itemTypeToken,
					]
				}

				const endLinePos = psUtils.getEndLinePos(state);
				state = psUtils.setCursor(state, endLinePos.line, endLinePos.symbol);

				return state;
			}
		}
	}

	return undefined;
}

const parseLiteral = (state: IParserState): IParserState => {
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
				value: '-'
			}

			const closeToken: ICodeToken = {
				type: CodeTokenType.NsMark,
				position: {
					line: state.cursor.line,
					symbol: 2 + nsResult.length + 1,
				},
				value: '-'
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
