import { ICodeToken, CodeTokenType, ITokenItem, ITokenLiteral } from "../api/ICodeToken";
import { isNullOrUndefined } from "util";

interface ICursorPosition {
	line: number;
	symbol: number;
}

interface IParserState {
	tokens: ICodeToken[];
	cursor: ICursorPosition;
	lines: string[];
}

interface IpsResult {
	result: boolean;
	state: IParserState;
}

export const parseFileContent = (sourceCode: string) => {
	const parserState: IParserState = {
		tokens: [],
		cursor: {line: 0, symbol: 0},
		lines: sourceCode.split(/\r?\n/g),
	}	

	let state = parserState;
	while (!isEndOfFile(state)) {
		const nlResult = parseNext(state);
		state = nlResult.state;
	}

	return state;
}

const parseNext = (state: IParserState): IpsResult => {
	
	if (isEndOfLine(state)) {
		state = jumpToNextLine(state, true);
	}
	
	if (isEndOfFile(state)) {
		return { result: false, state };
	}
	
	const cbResult = parseCommentBlock(state);
	if (cbResult.result) {
		return cbResult;
	}

	const nsResult = parseNamespace(state);
	if (nsResult.result) {
		return nsResult;
	}

	const ilResult = parseItemLine(state);
	if (ilResult.result) {
		return ilResult;
	}
	
	const clResult = parseCommentLine(state);
	if (clResult.result) {
		return clResult;
	}

	const llResult = parseLiteralLine(state);
	if (llResult.result) {
		return llResult;
	}

	return { result: true, state };
}

const parseItemLine = (state: IParserState): IpsResult => {

	if (state.cursor.symbol === 0) {
		
		const line = getCurrentLine(state);
		if (line) {
			const match = line.match(/^(\s*)\* (.+?):(?: )?(.+)?/);
			if (match) {
				const whitespace = match[1] || '';
				const indent = Math.floor(whitespace.length / 2);

				const itemName = match[2] || '';
				const itemType = match[3] || '';
				const symbolPos = {
					line: state.cursor.line,
					symbol: whitespace.length + 2,
					length: itemName.length + 2 + itemType.length,
				};

				const itemToken: ITokenItem = {
					codeTokenType: CodeTokenType.Item,
					itemName,
					itemType,
					indent,
					position: symbolPos,
					value: `${itemName}: ${itemType}`,
				};

				state = {
					...state,
					tokens: [...state.tokens, itemToken],
				}

				state = skipSymbols(state, line.length);

				return { result: true, state };
			}
		}

	}

	return { result: false, state };
}

const parseLiteralLine = (state: IParserState): IpsResult => {

	const line = getLineTextFromCursor(state);
	if (line) {
		const match = line.match(/^(.+?)(?:\/\*.*)?(?:\/\/.*)?$/);
		if (match) {
			const literalText = match[1] || '';
			const whitespace = literalText.match(/^s+/) || '';
			const indent = Math.floor(whitespace.length / 2);

			const symbolPos = {
				line: state.cursor.line,
				symbol: whitespace.length,
				length: literalText.length,
			};

			const literalToken: ITokenLiteral = {
				codeTokenType: CodeTokenType.Literal,
				indent,
				position: symbolPos,
				value: literalText,
			};

			state = {
				...state,
				tokens: [...state.tokens, literalToken],
			}

			state = skipSymbols(state, whitespace.length + literalText.length);

			return { result: true, state };
		}
	}

	return { result: false, state };
}

const parseCommentLine = (state: IParserState): IpsResult => {
	const str = getLineTextFromCursor(state);
	if (!str) {
		return { result: false, state };
	}

	const match = str.match(/^\/\/(.*)/);
	if (match) {
		const symbol = state.cursor.symbol + 2;
		const commentText = match[1] || '';

		const commentToken: ICodeToken = {
			codeTokenType: CodeTokenType.Comment,
			position: {
				line: state.cursor.line,
				length: commentText.length,
				symbol,
			},
			value: commentText,
		}

		state = {
			...state,
			tokens: [
				...state.tokens,
				commentToken
			]
		}
		state = skipSymbols(state, 2 + commentText.length);

		return { result: true, state }
	}

	return { result: false, state };
}

const parseCommentBlock = (state: IParserState): IpsResult => {
	const str = getLineTextFromCursor(state);
	if (!str) {
		return { result: false, state };
	}

	const match = str.match(/^\/\*(.*)/);
	if (match) {
		state = skipSymbols(state, 2);
		
		let commentText: string;

		const blockEndResult = findNext(state, /\*\//);
		if (blockEndResult.result) {
			commentText = readUntil(state, blockEndResult.cursor);
		}
		else {
			//if we here that means all the text in file is an unlosed comment block
			const endLineIndex = state.lines.length - 1;
			const endLine = getLine(state, endLineIndex);
			const endSymbol = (endLine || '').length;

			commentText = readUntil(state, { line: endLineIndex, symbol: endSymbol });
		}

		if (commentText) {
			const commentToken: ICodeToken = {
				codeTokenType: CodeTokenType.Comment,
				position: {
					line: state.cursor.line,
					symbol: state.cursor.symbol,
					length: commentText.length,
				},
				value: commentText,
			}

			state = {
				...state,
				tokens: [...state.tokens, commentToken],
				cursor: { ...blockEndResult.cursor, symbol: blockEndResult.cursor.symbol + 2},
			}

			return { result: true, state }
		}

		return { result: false, state }
	}

	return { result: false, state }
}

const parseNamespace = (state: IParserState): IpsResult => {
	if (state.cursor.symbol > 0) {
		return { result: false, state };
	}

	const lineText = getCurrentLine(state);
	if (!lineText) {
		return { result: false, state };
	}
	
	const match = lineText.match(/^\- (.+) \-/);
	
	if (!match || match.length === 0) {
		return { result: false, state };
	}
	
	const ns = match[1];
	
	if (ns && ns.length > 0) {
		const nsToken: ICodeToken = {
			codeTokenType: CodeTokenType.Namespace,
			position: {
				length: ns.length,
				line: state.cursor.line,
				symbol: 3,
			},
			value: ns,
		}

		state = {
			...state,
			cursor: {
				...state.cursor,
				symbol: 4 + ns.length,
			},
			tokens: [
				...state.tokens,
				nsToken,
			]
		},

		state = skipEmptySymbols(state).state;
	}

	return { result: true, state };
}

const readUntil = (state: IParserState, end: ICursorPosition, lineSeparator: string = '\n'): string => {

	if (end.line < state.cursor.line) {
		return undefined;
	}

	if (end.line === state.cursor.line && end.symbol <= state.cursor.symbol) {
		return undefined;
	}

	const currentLine = getLineTextFromCursor(state);
	if (currentLine) {
		if (end.line === state.cursor.line) {
			const ln = end.symbol - state.cursor.symbol;
			if (ln <= 0) {
				return undefined;
			}

			return currentLine.substring(0, ln);
		}
	}

	let result = currentLine ? [currentLine] : [];
	for (let lineIndex = state.cursor.line + 1; lineIndex <= end.line; lineIndex++) {
		const line = getLine(state, lineIndex);
		
		if (!line) {
			continue;
		}

		if (end.line > lineIndex) {
			result = [...result, line];
			continue;
		}

		const ln = end.symbol;
		if (ln > 0) {
			result = [...result, currentLine.substring(0, ln)];
			break;
		}

	}
	
	return result.join(lineSeparator);
}

const findNext = (state: IParserState, regex: RegExp): { cursor: ICursorPosition, result: boolean } => {
	
	const currentLine = getLineTextFromCursor(state);
	if (currentLine) {
		const match = regex.exec(currentLine);
		if (match) {
			return {
				cursor: {
					line: state.cursor.line,
					symbol: match.index + state.cursor.symbol,
				},
				result: true,
			}
		}
	}

	for (let lineIndex = state.cursor.line + 1; lineIndex < state.lines.length; lineIndex++) {
		const line = state.lines[lineIndex];

		if (line) {

			const match = regex.exec(line);
			if (match) {
				return {
					cursor: {
						line: lineIndex,
						symbol: match.index,
					},
					result: true,
				}
			}

		}
		
	}
	
	return {
		cursor: state.cursor,
		result: false,
	}
}

const skipSymbols = (state: IParserState, symbolsCount: number): IParserState => {
	const str = getLineTextFromCursor(state);
	if (!str) {
		return state;
	}

	state = {
		...state,
		cursor: {
			...state.cursor,
			symbol: state.cursor.symbol + symbolsCount,
		}
	}

	return state;
}

const skipEmptySymbols = (state: IParserState): IpsResult => {
	const str = getLineTextFromCursor(state);
	if (str) {
		const match = str.match(/^\s+/);
		if (match) {
			const length = match.length;
			state = {
				...state,
				cursor: {
					...state.cursor,
					symbol: state.cursor.symbol + length,
				}
			}

			return { result: true, state };
		}
	}

	return { result: false, state };
}

const jumpToNextLine = (state: IParserState, addNewLineToken: boolean): IParserState => {
	
	if (addNewLineToken) {
		const line = getCurrentLine(state) || '';
		const newLineToken: ICodeToken = {
			codeTokenType: CodeTokenType.NewLine,
			position: {line: state.cursor.line, symbol: line.length, length: 0}
		}

		state = {
			...state,
			tokens: [...state.tokens, newLineToken],
		}
	}

	state = {
		...state,
		cursor: {
			...state.cursor,
			line: state.cursor.line + 1,
			symbol: 0,
		}
	}

	return state;
}

const isEndOfFile = (state: IParserState): boolean => {
	if (!state.lines || state.lines.length <= state.cursor.line) {
		return true;
	}

	return false;
}
const isEndOfLine = (state: IParserState): boolean => {

	const line = getLineTextFromCursor(state);
	if (!line || line === '') {
		return true;
	}

	return false;
}

const getLineTextFromCursor = (state: IParserState): string => {
	return getLineTextFromCursorCustom(state, state.cursor);
}
const getLineTextFromCursorCustom = (state: IParserState, cursor: ICursorPosition): string => {
	const line = getLine(state, cursor.line);
	if (!line) {
		return undefined;
	}

	const symbol = cursor.symbol;

	if (symbol === 0) {
		return line;
	}

	if (line.length <= symbol) {
		return undefined;
	}

	return line.substring(symbol);
}

const getCurrentLine = (state: IParserState): string => {
	const lineIndex = state.cursor.line;
	return getLine(state, lineIndex);
}
const getLine = (state: IParserState, lineIndex: number): string => {
	const lines = state.lines;

	if (lines.length <= lineIndex) {
		return undefined;
	}

	const currentLine = lines[lineIndex];
	return currentLine;
}

