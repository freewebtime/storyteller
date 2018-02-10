import { ISymbolPosition } from "../api/ISymbolPosition";
import { IToken } from "../api/IToken";
import { tokenizerConfig, ITokenConfig } from "./tokenizerConfig";
import { TokenType } from "../api/TokenType";

export interface ITokenizerState {
	sourceCode: string;
	cursor: ISymbolPosition;
	globalCursor: number;
	tokens: IToken[];
}

export const stsTokenizer = {
	tokenizeCode: (sourceCode: string): ITokenizerState => {
		let state: ITokenizerState = {
			sourceCode: sourceCode,
			cursor: {
				line: 0, 
				symbol: 0
			},
			globalCursor: 0,
			tokens: [],
		};

		let nextToken: IToken;
		while (nextToken = stsTokenizer.getNextToken(state, TokenType.Word)) {
			state = stsTokenizer.addToken(state, nextToken);
		}

		return state;
	},

	getNextToken: (state: ITokenizerState, fallbackTokenType: TokenType, pattern?: string): IToken => {
		pattern = pattern || tokenizerConfig.allSeparatorsPattern;
		const regexp = new RegExp(pattern);
		const str = state.sourceCode.substring(state.globalCursor);

		const match = regexp.exec(str);
		if (!match) {
			return undefined;
		}

		let tokenLength: number;
		let tokenValue: string;
		let tokenType: TokenType;

		const searchIndex = match.index;
		if (searchIndex === 0) {
			tokenValue = match[0];
			tokenType = stsTokenizer.getTokenType(tokenValue);
			tokenLength = tokenValue.length;
		}
		
		if (!tokenValue) {
			//token type is fallbackTokenType
			tokenLength = searchIndex;
			tokenValue = str.substring(0, tokenLength) || '';
			tokenType = fallbackTokenType;
		}

		const start = { ...state.cursor }
		const end = {
			...start,
			symbol: start.symbol + tokenLength,
		};

		let token: IToken = {
			type: tokenType,
			value: tokenValue,
			start,
			end,
			length: tokenLength,
		};

		return token;
	},

	getTokenType: (tokenValue: string, tokensConfigs?: ITokenConfig[]): TokenType => {
		tokensConfigs = tokensConfigs || tokenizerConfig.tokens;
		for (let tokenIndex = 0; tokenIndex < tokensConfigs.length; tokenIndex++) {
			const tokenConfig = tokensConfigs[tokenIndex];
			const regexp = new RegExp(tokenConfig.pattern);
			const match = regexp.exec(tokenValue);
			if (match) {
				return tokenConfig.type;
			}
		}

		return undefined;
	},

	addToken: (state: ITokenizerState, token: IToken): ITokenizerState => {
		const tokens = [
			...state.tokens,
			token,
		];
		const tokenLenght = token.end.symbol - token.start.symbol;
		const globalCursor = state.globalCursor + tokenLenght;
		let cursor: ISymbolPosition = {...state.cursor};

		if (token.type === TokenType.Endline) {
			cursor = {
				line: cursor.line + 1,
				symbol: 0,
			};
		} else {
			cursor = {
				...state.cursor,
				symbol: state.cursor.symbol + tokenLenght,
			};
		}
		
		state = {
			...state,
			tokens,
			globalCursor,
			cursor,
		};

		return state;
	}
}