import {
	IParserState,
	IpsResult2
} from "./IParserState";
import {
	ICodeToken,
	CodeTokenType,
	ISymbolPosition,
	INamespaceToken,
	ITextToken
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
	[CodeTokenType.SqBracketOpen]: '\[',
	[CodeTokenType.SqBracketClose]: '\]',
};

const keywords = {
	...separators,
	[CodeTokenType.NsMarkStart]: '- ',
	[CodeTokenType.NsMarkEnd]: ' -',
}

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
	keywords,
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
	skipEmptySymbols: (state: IParserState): IParserState => {
		const rr = psUtils.readNext(state, / +/);

		if (!rr) {
			return state;
		}

		return psUtils.skipSymbols(state, rr.length);
	},

	addToken: (state: IParserState, token: ICodeToken, isSkipSymbols: boolean = true): IParserState => {
		if (!token) {
			return state;
		}

		state = {
			...state,
			tokens: [
				...state.tokens,
				token
			]
		};

		if (isSkipSymbols) {
			const tokenLength = (token.value || '').length;
			state = psUtils.skipSymbols(state, tokenLength);
		}

		return state;
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

	readWord: (state: IParserState, line: number | undefined = undefined, symbol: number | undefined = undefined): string => {
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
		const result = symbol >= lineLength;
		return result;
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

	parseWord: (state: IParserState, tokenType: CodeTokenType): ICodeToken => {
		const tokenValue = psUtils.readWord(state);

		if (!tokenValue) {
			return undefined;
		}

		const token: ICodeToken = {
			type: tokenType,
			position: { ...state.cursor },
			value: tokenValue
		};

		return token;
	},
	
	parseNext: (state: IParserState, pattern: RegExp, tokenType: CodeTokenType): ICodeToken => {
		const tokenValue = psUtils.readNext(state, pattern);

		if (!tokenValue) {
			return undefined;
		}

		const token: ICodeToken = {
			type: tokenType,
			position: { ...state.cursor },
			value: tokenValue
		};

		return token;
	},

	parseKeyword: (state: IParserState, keyword: CodeTokenType): ICodeToken => {
		const pattern = psUtils.keywords[keyword];
		if (!pattern) {
			return undefined;
		}

		const regex = new RegExp(pattern);
		const kwValue = psUtils.readNext(state, regex);

		if (!kwValue) {
			return undefined;
		}

		const token: ICodeToken = {
			type: keyword,
			position: { ...state.cursor },
			value: kwValue
		};

		return token;
	},

	parseParenOpen2: (state: IParserState): IParserState => {
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
	},
	parseParenClose2: (state: IParserState): IParserState => {
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
	},
	parseColon2: (state: IParserState): IParserState => {
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
	},
	parseComma2: (state: IParserState): IParserState => {
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
	},
	parseStar2: (state: IParserState): IParserState => {
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
	},
	parseDot2: (state: IParserState): IParserState => {
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
	},
	parseNsMarkStart2: (state: IParserState): IParserState => {
		const nsmResult = psUtils.readNext(state, new RegExp(/- /));

		if (!nsmResult) {
			return undefined;
		}

		const nsmToken: ICodeToken = {
			type: CodeTokenType.NsMarkStart,
			position: { ...state.cursor },
			value: nsmResult
		};

		state = psUtils.addToken(state, nsmToken);
		state = psUtils.skipSymbols(state, nsmResult.length);

		return state;
	},
	parseNsMarkEnd2: (state: IParserState): IParserState => {
		const nsmResult = psUtils.readNext(state, new RegExp(/ -/));

		if (!nsmResult) {
			return undefined;
		}

		const nsmToken: ICodeToken = {
			type: CodeTokenType.NsMarkStart,
			position: { ...state.cursor },
			value: nsmResult
		};

		state = psUtils.addToken(state, nsmToken);
		state = psUtils.skipSymbols(state, nsmResult.length);

		return state;
	},

	parseNamespace: (state: IParserState): ICodeToken => {
		
		if (state.cursor.symbol !== 0) {
			return undefined;
		}

		const openMark = psUtils.parseKeyword(state, CodeTokenType.NsMarkStart);
		
		if (openMark) {
			state = psUtils.skipSymbols(state, openMark.value.length);
			const nsName = psUtils.parseNsName(state);
			
			if (nsName) {
				state = psUtils.skipSymbols(state, nsName.value.length);
				const closeMark = psUtils.parseKeyword(state, CodeTokenType.NsMarkEnd);

				if (closeMark) {

					const token: INamespaceToken = {
						type: CodeTokenType.Namespace,
						position: {...openMark.position},
						value: '' + openMark.value + nsName.value + closeMark.value,
						openMark,
						closeMark,
						name: nsName
					}

					return token;
				}

			}

		}
	
		return undefined;
	},

	parseNsName: (state: IParserState): ICodeToken => {
		const nsName = psUtils.parseWord(state, CodeTokenType.Word);
		if (!nsName) {
			return undefined;
		}

		let words = [nsName];
		let textValue = nsName.value || '';
		state = psUtils.skipSymbols(state, nsName.value.length);

		let dot: ICodeToken;
		while (dot = psUtils.parseKeyword(state, CodeTokenType.Dot)) {
			words = [...words, dot];
			textValue = textValue + dot.value;
			state = psUtils.skipSymbols(state, dot.value.length);

			const word = psUtils.parseWord(state, CodeTokenType.Word);
			if (word) {
				words = [...words, word];
				textValue = textValue + word.value;
				state = psUtils.skipSymbols(state, word.value.length);
			}
		}

		const nsNameToken: ITextToken = {
			type: CodeTokenType.Text,
			position: {...nsName.position},
			value: textValue,
			words: words,
		};

		return nsNameToken;
	},

}