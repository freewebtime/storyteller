import { ICodeToken, CodeTokenType } from "../api/ICodeToken";

interface IParserState {
	tokens: ICodeToken[];
	cursor: {
		line: number;
		symbol: number;
	},
	lines: string[],
}

export const parseFileContent = (sourceCode: string) => {
	const parserState: IParserState = {
		tokens: [],
		cursor: {line: 0, symbol: 0},
		lines: sourceCode.split(/\r?\n/g),
	}	

	const parsed = parseNextLine(parserState);
	console.log(parsed.tokens.length);
}

const parseNextLine = (state: IParserState): IParserState => {
	
	if (isEndOfFile(state)) {
		return state;
	}
	
	const nsResult = parseNamespace(state);
	if (nsResult.result === true) {
		return parseNextLine(nsResult.state);
	}

	state = {
		...state,
		cursor: {
			line: state.cursor.line + 1,
			symbol: 0,
		}
	}
	return parseNextLine(state);

	const unparsedLineText = getLineTextFromCursor(state);
	if (!unparsedLineText || unparsedLineText.length === 0) {
		state = {
			...state,
			cursor: {
				...state.cursor,
				line: state.cursor.line + 1,
				symbol: 0,
			}
		}
	}

	if (isEndOfFile(state)) {
		return state;
	}

	return parseNextLine(state);
}

const parseNamespace = (state: IParserState): {result: boolean, state: IParserState} => {
	if (state.cursor.symbol > 0) {
		return { result: false, state };
	}

	const lineText = getCurrentLine(state);
	
	if (!lineText) {
		return { result: false, state };
	}

	const match = lineText.match(/\- (.+) \-\s+?(\/\/.*)?/);
	
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
				line: state.cursor.line + 1,
				symbol: 0,
			},
			tokens: [
				...state.tokens,
				nsToken,
			]
		}
	}

	return { result: true, state };
}

const isEndOfFile = (state: IParserState): boolean => {
	if (!state.lines || state.lines.length <= state.cursor.line) {
		return true;
	}

	return false;
}

const getLineTextFromCursor = (state: IParserState): string => {
	const line = getCurrentLine(state);
	if (!line) {
		return undefined;
	}

	const symbol = state.cursor.symbol;
	
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
	const lines = state.lines;

	if (lines.length <= lineIndex) {
		return undefined;
	}

	const currentLine = lines[lineIndex];
	return currentLine;
}

