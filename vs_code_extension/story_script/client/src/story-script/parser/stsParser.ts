import { ICodeToken, CodeTokenType } from "../api/ICodeToken";
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

	console.log(state.tokens.length);
}

const parseNext = (state: IParserState): IpsResult => {
	
	if (isEndOfFile(state)) {
		return { result: false, state };
	}
	
	state = parseNamespace(state).state;
	state = parseCommentLine(state).state;
	state = parseCommentBlock(state).state;

	if (isEndOfLine(state)) {
		state = jumpToNextLine(state);
	}

	return { result: true, state };
}

const parseCommentLine = (state: IParserState): IpsResult => {
	state = skipEmptySymbols(state);
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
		state = jumpToNextLine(state);

		return { result: true, state }
	}

	return { result: false, state };
}

const parseCommentBlock = (state: IParserState): IpsResult => {
	state = skipEmptySymbols(state);
	const str = getLineTextFromCursor(state);
	if (!str) {
		return { result: false, state };
	}

	const match = str.match(/\/\*(.*)/);
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
	
	const match = lineText.match(/^\- (.+) \-\s+?(\/\/.*)?$/);
	
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
		}
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
					symbol: match.index,
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

const skipEmptySymbols = (state: IParserState): IParserState => {
	const str = getLineTextFromCursor(state);
	if (!str) {
		return state;
	}

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
	}

	return state;
}

const jumpToNextLine = (state: IParserState): IParserState => {
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

