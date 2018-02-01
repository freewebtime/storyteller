import {
	IParserState,
	IpsResult2,
	IParseTokenResult
} from "./IParserState";
import {
	ICodeToken,
	CodeTokenType,
	ISymbolPosition,
	INamespaceToken,
	ITextToken,
	IItemToken,
	IArrayToken,
	IItemTypeToken,
	IFuncTypeToken,
	IFuncParamToken,
	IMentionToken,
	ICallToken
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
	[CodeTokenType.SqBracketOpen]: '\\[',
	[CodeTokenType.SqBracketClose]: '\\]',
};

const keywords = {
	...separators,
	[CodeTokenType.NsMarkStart]: '- ',
	[CodeTokenType.NsMarkEnd]: ' -',
	[CodeTokenType.ItemMark]: '\\* ',
	[CodeTokenType.MentionMark]: '\\*',
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
	setCursor2: (state: IParserState, cursor: ISymbolPosition): IParserState => {
		return {
			...state,
			cursor: {...cursor}
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
	moveCursor: (cursor: ISymbolPosition, deltaSymbols: number): ISymbolPosition => {
		return {
			...cursor,
			symbol: cursor.symbol + deltaSymbols
		};
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

	parseSeparator: (state: IParserState): IParseTokenResult => {
		const tokenValue = psUtils.readSeparator(state);

		if (!tokenValue) {
			return undefined;
		}

		const token: ICodeToken = {
			type: tokenValue.id as CodeTokenType,
			position: { ...state.cursor },
			value: tokenValue.value
		};
		const cursor = psUtils.moveCursor(state.cursor, tokenValue.value.length);
		state = psUtils.setCursor2(state, cursor);

		return {
			token,
			state
		};
	},
	parseWord: (state: IParserState, tokenType: CodeTokenType): IParseTokenResult => {
		const tokenValue = psUtils.readWord(state);

		if (!tokenValue) {
			return undefined;
		}

		const token: ICodeToken = {
			type: tokenType,
			position: { ...state.cursor },
			value: tokenValue
		};
		const cursor = psUtils.moveCursor(state.cursor, tokenValue.length);
		state = psUtils.setCursor2(state, cursor);

		return {
			token,
			state
		};
	},
	parseNext: (state: IParserState, pattern: RegExp, tokenType: CodeTokenType): IParseTokenResult => {
		const tokenValue = psUtils.readNext(state, pattern);

		if (!tokenValue) {
			return undefined;
		}

		const token: ICodeToken = {
			type: tokenType,
			position: { ...state.cursor },
			value: tokenValue
		};

		const cursor = psUtils.moveCursor(state.cursor, tokenValue.length);
		state = psUtils.setCursor2(state, cursor);

		return {
			token,
			state
		};
	},
	parseUntil: (state: IParserState, pattern: RegExp, tokenType: CodeTokenType): IParseTokenResult => {
		const tokenValue = psUtils.readUntil(state, pattern);

		if (!tokenValue) {
			return undefined;
		}

		const token: ICodeToken = {
			type: tokenType,
			position: { ...state.cursor },
			value: tokenValue
		};

		const cursor = psUtils.moveCursor(state.cursor, tokenValue.length);
		state = psUtils.setCursor2(state, cursor);

		return {
			token,
			state
		};
	},
	parseKeyword: (state: IParserState, keyword: CodeTokenType): IParseTokenResult => {
		const pattern = psUtils.keywords[keyword];
		if (!pattern) {
			return undefined;
		}

		const regex = new RegExp(pattern);
		const tokenValue = psUtils.readNext(state, regex);

		if (!tokenValue) {
			return undefined;
		}

		const token: ICodeToken = {
			type: keyword,
			position: { ...state.cursor },
			value: tokenValue
		};

		const cursor = psUtils.moveCursor(state.cursor, tokenValue.length);
		state = psUtils.setCursor2(state, cursor);

		return {
			token,
			state
		};
	},
	parseWhitespace: (state: IParserState, tokenType: CodeTokenType = CodeTokenType.Whitespace): IParseTokenResult => {
		const pattern = /\s*/;
		const tokenValue = psUtils.readNext(state, pattern);

		if (!tokenValue) {
			return undefined;
		}

		const token: ICodeToken = {
			type: tokenType,
			position: { ...state.cursor },
			value: tokenValue
		};

		const cursor = psUtils.moveCursor(state.cursor, tokenValue.length);
		state = psUtils.setCursor2(state, cursor);

		return {
			token,
			state
		};
	},

	parseNamespace: (state: IParserState): IParseTokenResult => {
		if (state.cursor.symbol !== 0) {
			return undefined;
		}

		const openMark = psUtils.parseKeyword(state, CodeTokenType.NsMarkStart);
		if (!openMark) {
			return undefined;
		}

		state = openMark.state;
		const nsName = psUtils.parseNsName(state);

		if (!nsName) {
			return undefined;
		}

		state = nsName.state;
		const closeMark = psUtils.parseKeyword(state, CodeTokenType.NsMarkEnd);

		if (!closeMark) {
			return undefined;
		}

		state = closeMark.state;
		const token: INamespaceToken = {
			type: CodeTokenType.Namespace,
			position: { ...nsName.token.position },
			name: nsName.token
		};
	
		return {
			state,
			token,
		};
	},
	parseNsName: (state: IParserState): IParseTokenResult => {
		const nsName = psUtils.parseWord(state, CodeTokenType.Word);
		if (!nsName) {
			return undefined;
		}

		state = nsName.state;
		let words = [nsName.token];
		let textValue = nsName.token.value || '';

		let dot: IParseTokenResult;
		while (dot = psUtils.parseKeyword(state, CodeTokenType.Dot)) {
			textValue = textValue + dot.token.value;
			state = dot.state;

			const word = psUtils.parseWord(state, CodeTokenType.Word);
			if (word) {
				words = [...words, word.token];
				textValue = textValue + word.token.value;
				state = word.state;
			}
		}

		const token: ITextToken = {
			type: CodeTokenType.Text,
			position: { ...nsName.token.position },
			value: textValue,
			words: words,
		};

		return {
			state,
			token
		};
	},

	parseItem: (state: IParserState): IParseTokenResult => {
		if (state.cursor.symbol !== 0) {
			return undefined;
		}

		let indent = 0;
		const whitespace = psUtils.parseWhitespace(state);
		if (whitespace) {
			state = whitespace.state;
			indent = (whitespace.token.value || '').length;
		}

		const itemMark = psUtils.parseKeyword(state, CodeTokenType.ItemMark);
		if (!itemMark) {
			return undefined;
		}

		state = itemMark.state;
		const itemName = psUtils.parseWord(state, CodeTokenType.Word);

		if (itemName) {
			state = itemName.state;
		}

		const colon = psUtils.parseKeyword(state, CodeTokenType.Colon);
		if (!colon) {
			return undefined;
		}

		state = colon.state;

		const itemType = psUtils.parseItemType(state);
		if (itemType) {
			state = itemType.state;
		}

		const token: IItemToken = {
			type: CodeTokenType.Item,
			position: { ...itemMark.token.position },
			indent,
			itemName: itemName ? itemName.token : undefined,
			itemType: itemType ? itemType.token : undefined,
		};

		return {
			token,
			state
		};
	},
	parseItemType: (state: IParserState): IParseTokenResult => {
		state = psUtils.skipEmptySymbols(state);

		const itemName = psUtils.parseWord(state, CodeTokenType.Word);
		if (!itemName) {
			return undefined;
		}

		state = itemName.state;

		let words = [itemName.token];

		const array = psUtils.parseArray(state);
		if (array) {
			words = [...words, array.token];
			state = array.state;
		}

		let dot: IParseTokenResult;
		while (dot = psUtils.parseKeyword(state, CodeTokenType.Dot)) {
			state = dot.state;

			const subName = psUtils.parseWord(state, CodeTokenType.Word);
			if (subName) {
				words = [...words, subName.token];
				state = subName.state;

				const subarray = psUtils.parseArray(state);
				if (subarray) {
					words = [...words, subarray.token];
					state = subarray.state;
				}
			}
		}

		const funcType = psUtils.parseFuncType(state);
		if (funcType) {
			words = [...words, funcType.token];
			state = funcType.state;
		}

		const token: IItemTypeToken = {
			type: CodeTokenType.ItemType,
			position: { ...itemName.token.position },
			words,
		};

		return {
			state,
			token
		};
	},
	parseFuncType: (state: IParserState): IParseTokenResult => {
		const openParen = psUtils.parseKeyword(state, CodeTokenType.ParenOpen);
		if (!openParen) {
			return undefined;
		}

		state = openParen.state;
		state = psUtils.skipEmptySymbols(state);
		
		let funcParams = [];
		let paramName: IParseTokenResult;
		
		while (paramName = psUtils.parseWord(state, CodeTokenType.ParamName)) {
			state = paramName.state;
			let paramType: ICodeToken;

			const colon = psUtils.parseKeyword(state, CodeTokenType.Colon);
			if (colon) {
				state = colon.state;
				state = psUtils.skipEmptySymbols(state);

				const ptResult = psUtils.parseItemType(state);
				if (ptResult) {
					paramType = ptResult.token;
					state = ptResult.state;
				}

			}

			const paramToken: IFuncParamToken = {
				type: CodeTokenType.Param,
				position: { ...paramName.token.position },
				paramName: paramName.token,
				paramType,
			};
			funcParams = [...funcParams, paramToken];
			state = psUtils.skipEmptySymbols(state);

			const commaResult = psUtils.parseKeyword(state, CodeTokenType.Comma);
			if (!commaResult) {
				break;
			}

			state = commaResult.state;
			state = psUtils.skipEmptySymbols(state);
		}

		const closeParen = psUtils.parseKeyword(state, CodeTokenType.ParenClose);
		if (!closeParen) {
			return undefined;
		}

		state = closeParen.state;
		const token: IFuncTypeToken = {
			type: CodeTokenType.FuncType,
			position: { ...openParen.token.position },
			params: funcParams,
		};

		return {
			state,
			token
		};
	},
	parseArray: (state: IParserState): IParseTokenResult => {
		state = psUtils.skipEmptySymbols(state);
		const openBracket = psUtils.parseKeyword(state, CodeTokenType.SqBracketOpen);

		if (!openBracket) {
			return undefined;
		}

		state = openBracket.state;
		const arrayIndex = psUtils.parseNext(state, /'d+/, CodeTokenType.Number);
		
		if (arrayIndex) {
			state = arrayIndex.state;
		}

		const closeBracket = psUtils.parseKeyword(state, CodeTokenType.SqBracketClose);
		if (!closeBracket) {
			return undefined;
		}		

		state = closeBracket.state;
		const token: IArrayToken = {
			type: CodeTokenType.Array,
			position: { ...openBracket.token.position },
			arrayIndex: arrayIndex ? arrayIndex.token : undefined
		};

		return {
			state,
			token
		};
	},

	parseLiteral: (state: IParserState): IParseTokenResult => {
		let words = [];
		let word: IParseTokenResult;
		const position = {...state.cursor};

		while (word = psUtils.parseLiteralWord(state)) {
			words = [...words, word.token];
			state = word.state;
		}

		const token: ITextToken = {
			type: CodeTokenType.Literal,
			position,
			words,
		};

		return {
			state,
			token
		};
	},

	parseLiteralWord: (state: IParserState): IParseTokenResult => {
		const whitespace = psUtils.parseWhitespace(state);
		if (whitespace) {
			return whitespace;
		}

		const mention = psUtils.parseMention(state);
		if (mention) {
			return mention;
		}

		const word = psUtils.parseUntil(state, /[\*$]/, CodeTokenType.Word);
		if (word) {
			return word;
		}

		return undefined;
	},

	parseMention: (state: IParserState): IParseTokenResult => {
		const mentionMark = psUtils.parseKeyword(state, CodeTokenType.MentionMark);

		if (!mentionMark) {
			return undefined;
		}

		state = mentionMark.state;
		let words = [];
		let mpResult: IParseTokenResult;

		while (mpResult = psUtils.parseMentionPart(state)) {
			state = mpResult.state;
			words = [...words, mpResult.token];

			const dot = psUtils.parseKeyword(state, CodeTokenType.Dot);
			if (dot) {
				state = dot.state;
			}
		}

		const token: IMentionToken = {
			type: CodeTokenType.Mention,
			words,
			position: {...mentionMark.token.position}
		}

		return {
			state,
			token
		};
	},

	parseMentionPart: (state: IParserState): IParseTokenResult => {
		const mWord = psUtils.parseWord(state, CodeTokenType.Text);
		if (mWord) {
			return mWord;
		}

		const mArray = psUtils.parseCallArray(state);
		if (mArray) {
			return mArray;
		} 

		const mCall = psUtils.parseCall(state);
		if (mCall) {
			return mCall;
		}

		return undefined;
	},

	parseCall: (state: IParserState): IParseTokenResult => {
		const openParen = psUtils.parseKeyword(state, CodeTokenType.ParenOpen);
		if (!openParen) {
			return undefined;
		}

		state = openParen.state;
		state = psUtils.skipEmptySymbols(state);

		let funcParams = [];
		let paramName: IParseTokenResult;

		while (paramName = psUtils.parseMention(state)) {
			state = paramName.state;
			let paramType: ICodeToken;

			const colon = psUtils.parseKeyword(state, CodeTokenType.Colon);
			if (colon) {
				state = colon.state;
				state = psUtils.skipEmptySymbols(state);

				const ptResult = psUtils.parseItemType(state);
				if (ptResult) {
					paramType = ptResult.token;
					state = ptResult.state;
				}

			}

			const paramToken: IFuncParamToken = {
				type: CodeTokenType.Param,
				position: { ...paramName.token.position },
				paramName: paramName.token,
				paramType,
			};
			funcParams = [...funcParams, paramToken];
			state = psUtils.skipEmptySymbols(state);

			const commaResult = psUtils.parseKeyword(state, CodeTokenType.Comma);
			if (!commaResult) {
				break;
			}

			state = commaResult.state;
			state = psUtils.skipEmptySymbols(state);
		}

		const closeParen = psUtils.parseKeyword(state, CodeTokenType.ParenClose);
		if (!closeParen) {
			return undefined;
		}

		state = closeParen.state;
		const token: ICallToken = {
			type: CodeTokenType.Call,
			position: { ...openParen.token.position },
			params: funcParams,
		};

		return {
			state,
			token
		};
	},
	parseCallArray: (state: IParserState): IParseTokenResult => {
		state = psUtils.skipEmptySymbols(state);
		const openBracket = psUtils.parseKeyword(state, CodeTokenType.SqBracketOpen);

		if (!openBracket) {
			return undefined;
		}

		state = openBracket.state;
		const arrayIndex = psUtils.parseNext(state, /'d+/, CodeTokenType.Number);

		if (arrayIndex) {
			state = arrayIndex.state;
		}

		const closeBracket = psUtils.parseKeyword(state, CodeTokenType.SqBracketClose);
		if (!closeBracket) {
			return undefined;
		}

		state = closeBracket.state;
		const token: IArrayToken = {
			type: CodeTokenType.Array,
			position: { ...openBracket.token.position },
			arrayIndex: arrayIndex ? arrayIndex.token : undefined
		};

		return {
			state,
			token
		};
	},

}