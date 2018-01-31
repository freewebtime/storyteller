import {
	IParserState,
	IpsResult2
} from "./IParserState";
import {
	ICodeToken,
	CodeTokenType,
	ISymbolPosition
} from "../api/ICodeToken";

const separators = {
	[CodeTokenType.Endline]: '\\r?\\n',
	[CodeTokenType.Colon]: ':',
	[CodeTokenType.Comma]: ',',
	[CodeTokenType.Dot]: '\\.',
	[CodeTokenType.Space]: '\\s',
	[CodeTokenType.ParenClose]: '\\)',
	[CodeTokenType.ParenOpen]: '\\(',
	[CodeTokenType.Backslash]: '\\\\',
	[CodeTokenType.Slash]: '\/',
};

const _allSeparators = Object.keys(separators).map((sepId: string) => {
	const result = {
		id: sepId, 
		pattern: separators[sepId],
	};

	return result;
});

const allSeparators = [..._allSeparators, {id: CodeTokenType.Endline, pattern: '$'}];

const allSeparatorsPattern = allSeparators.reduce((prev: string, curr: {id: string, pattern: string}, index, array): string=>{
	return prev ? `${prev}|(${curr.pattern})` : `(${curr.pattern})`;
}, '');

export const psUtils = {
	separators,
	allSeparators,
	allSeparatorsPattern,

	checkCursorPos: (state: IParserState, line: number | undefined = undefined, symbol: number | undefined = undefined): {line: number, symbol: number} => {
		if (line === undefined) {
			line = state.cursor.line;
		}

		if (symbol === undefined) {
			symbol = state.cursor.symbol;
		}

		return { line, symbol };
	},
	setCursor: (state: IParserState, line: number | undefined = undefined, symbol: number | undefined = undefined): IParserState => {
		const cp = psUtils.checkCursorPos(state, line, symbol);
		line = cp.line;
		symbol = cp.symbol;

		return {
			...state,
			cursor: {
				...state.cursor,
				line,
				symbol,
			}
		}
	},
	setCursorAtLineEnd: (state: IParserState, line: number | undefined = undefined) => {
		const newPos = psUtils.getEndLinePos(state, line);
		if (!newPos) {
			return undefined;
		}

		state = psUtils.setCursor(state, newPos.line, newPos.symbol);
		return state;
	},
	skipSymbols: (state: IParserState, deltaSymbols: number): IParserState => {

		const line = state.cursor.line;
		const symbol = state.cursor.symbol + deltaSymbols;

		return {
			...state,
			cursor: {
				...state.cursor,
				line,
				symbol,
			}
		}
	},

	readNext: (state: IParserState, pattern: RegExp, line: number | undefined = undefined, symbol: number | undefined = undefined): string => {
		const str = psUtils.getLineText(state, line, symbol);
		if (!str) {
			return undefined;
		}

		const match = str.match(pattern);
		if (match && match.length > 0 && match.index === 0) {
			return match[0];
		}

		return undefined;
	},

	findNext: (state: IParserState, pattern: RegExp, line: number | undefined = undefined, symbol: number | undefined = undefined): {
		position: ISymbolPosition,
		searchResult: string,
	} => {
		const str = psUtils.getLineText(state, line, symbol);
		if (!str) {
			return undefined;
		}

		const cp = psUtils.checkCursorPos(state, line, symbol);
		line = cp.line;
		symbol = cp.symbol;

		const match = str.match(pattern);
		if (match && match.length > 0) {
			symbol = symbol + match.index;
			return { 
				position: {
					line,
					symbol
				},
				searchResult: match[0] 
			};
		}

		return undefined;
	},
	findNextMultiline: (state: IParserState, pattern: RegExp, line: number | undefined = undefined, symbol: number | undefined = undefined): {
		position: ISymbolPosition,
		searchResult: string,
	} => {
		if (psUtils.isEndOfFile(state, line, symbol)) {
			return undefined;
		}

		const cp = psUtils.checkCursorPos(state, line, symbol);
		line = cp.line;
		symbol = cp.symbol;

		for (let lineIndex = line; lineIndex < state.lines.length; lineIndex++) {
			const symbolIndex = lineIndex === line ? symbol : 0;
			const lineResult = psUtils.findNext(state, pattern, lineIndex, symbolIndex);

			if (lineResult) {
				return lineResult;
			}
		}

		return undefined;
	},

	readUntil: (state: IParserState, pattern: RegExp, line: number | undefined = undefined, symbol: number | undefined = undefined): string => {
		const str = psUtils.getLineText(state, line, symbol);
		if (!str) {
			return undefined;
		}

		const match = str.match(pattern);
		if (match) {
			return str.substring(0, match.index);
		}

		return undefined;
	},
	readUntilMultiline: (state: IParserState, pattern: RegExp, line: number | undefined = undefined, symbol: number | undefined = undefined): string[] => {
		if (psUtils.isEndOfFile(state, line, symbol)) {
			return undefined;
		}

		const cp = psUtils.checkCursorPos(state, line, symbol);
		line = cp.line;
		symbol = cp.symbol;

		let result = [];
		for (let lineIndex = line; lineIndex < state.lines.length; lineIndex++) {
			const symbolIndex = lineIndex === line ? symbol : 0;
			const lineResult = psUtils.readUntil(state, pattern, lineIndex, symbolIndex);

			if (lineResult || lineResult === '') {
				result = [...result, lineResult];
				return result;
			}

			const lineText = psUtils.getLineText(state, lineIndex, symbolIndex) || '';
			result = [...result, lineText];
		}

		return undefined;
	},

	readUtilSeparator: (state: IParserState, line: number | undefined = undefined, symbol: number | undefined = undefined): string => {
		const str = psUtils.getLineText(state, line, symbol);
		if (!str) {
			return undefined;
		}

		const pattern = psUtils.allSeparatorsPattern;
		const match = str.match(pattern);
		if (match) {
			const result = str.substring(0, match.index);
			return result;
		}

		return undefined;
	},

	checkSeparatorType: (text: string): string => {
		if (!text) {
			return undefined;
		}
		
		const match = text.match(`^(?:${psUtils.allSeparatorsPattern})`);
		if (match) {
			const separators = psUtils.allSeparators;
			for (let sepIndex = 0; sepIndex < separators.length; sepIndex++) {
				const matchIndex = sepIndex + 1;
				const matchResult = match.length > matchIndex ? match[matchIndex] : undefined;

				if (!matchResult) {
					continue;
				}

				const separator = separators[sepIndex];
				return separator.id;
			}
		}

		return undefined;
	},

	readSeparator: (state: IParserState, line: number | undefined = undefined, symbol: number | undefined = undefined): {id: string, value: string} => {
		const str = psUtils.getLineText(state, line, symbol);
		if (!str) {
			return undefined;
		}

		const match = str.match(`^(?:${psUtils.allSeparatorsPattern})`);
		if (match && match[0]) {
			const separatorId = psUtils.checkSeparatorType(match[0]);
			return { 
				id: separatorId, 
				value: match[0] 
			};
		}

		return undefined;
	},

	getLineText: (state: IParserState, line: number | undefined = undefined, symbol: number | undefined = undefined): string => {
		if (psUtils.isEndOfLine(state, line, symbol)) {
			return undefined;
		}
		
		const cp = psUtils.checkCursorPos(state, line, symbol);
		line = cp.line;
		symbol = cp.symbol;

		const lineText = state.lines[line];
		const result = lineText.substring(symbol);

		return result;
	},

	getEndLinePos: (state: IParserState, line: number | undefined = undefined): ISymbolPosition => {
		const cp = psUtils.checkCursorPos(state, line, undefined);
		line = cp.line;

		if (!state.lines) {
			return undefined;
		}

		if (state.lines.length < line) {
			return undefined;
		}

		const lineText = psUtils.getLineText(state, line, 0);
		if (!lineText) {
			return { line, symbol: 0 };
		}

		return { line, symbol: lineText.length };
	},

	getEndFilePos: (state: IParserState): ISymbolPosition => {
		if (!state.lines) {
			return undefined;
		}

		const line = state.lines.length - 1;
		return psUtils.getEndLinePos(state, line);
	},

	isEndOfLine: (state: IParserState, line: number | undefined = undefined, symbol: number | undefined = undefined): boolean => {
		const cp = psUtils.checkCursorPos(state, line, symbol);
		line = cp.line;
		symbol = cp.symbol;

		if (psUtils.isEndOfFile(state, line, symbol)) {
			return true;
		}

		const lineText = state.lines[line] || '';
		const lineLength = lineText.length;
		const result = symbol < lineLength - 1;
		return !result;
	},

	isEndOfFile: (state: IParserState, line: number | undefined = undefined, symbol: number | undefined = undefined): boolean => {
		if (!state.lines) {
			return true;
		}

		const cp = psUtils.checkCursorPos(state, line, symbol);
		line = cp.line;
		symbol = cp.symbol;

		if (state.lines.length <= line) {
			return true;
		}

		if (state.lines.length - 1 === line) {
			const lineText = state.lines[line];
			const result = lineText && symbol < lineText.length;
			return !result;
		}

		return false;
	},

	combinePatterns: (patterns: string[]) => {
		const result = patterns.reduce((prev: string, curr: string, index, array): string => {
			return prev ? `${prev}|(${curr})` : `(${curr})`;
		}, '');

		return result;
	},

}