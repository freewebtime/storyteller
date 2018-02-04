import { ISymbolPosition } from "../api/ISymbolPosition";
import { IToken } from "../api/IToken";
import { tokenizerConfig } from "./tokenizerConfig";
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

		const nextToken = stsTokenizer.readNext(state, TokenType.Text);
		state = {
			...state,
			tokens: [
				...state.tokens,
				nextToken,
			]
		};

		return state;
	},

	readNext: (state: ITokenizerState, fallbackTokenType: TokenType): IToken => {
		const regexp = tokenizerConfig.allTokensRegexp;
		regexp.lastIndex = state.globalCursor;

		const match = regexp.exec(state.sourceCode);
		if (!match) {
			return undefined;
		}

		const searchIndex = match.index - state.globalCursor;
		if (searchIndex > 0) {
			//token type is fallbackTokenType
			const tokenLenght = searchIndex;
			const tokenValue = state.sourceCode.substring(state.globalCursor, tokenLenght) || '';
			const token: IToken = {
				type: fallbackTokenType,
				start: {...state.cursor},
				end: {
					...state.cursor,
					symbol: state.cursor.symbol + tokenLenght,
				},
				value: tokenValue,
			};

			return token;
		}

		const tokenValue = match[0];
		const tokenType = stsTokenizer.getTokenType(tokenValue);
		const tokenLenght = tokenValue.length;
		const token: IToken = {
			type: tokenType,
			value: tokenValue,
			start: {...state.cursor},
			end: {
				...state.cursor,
				symbol: state.cursor.symbol + tokenLenght
			}
		};

		return token;
	},

	getTokenType: (tokenValue: string): TokenType => {
		const allTokens = tokenizerConfig.tokens;
		for (let tokenIndex = 0; tokenIndex < allTokens.length; tokenIndex++) {
			const tokenConfig = allTokens[tokenIndex];
			const regexp = new RegExp(tokenConfig.pattern);
			const match = regexp.exec(tokenValue);
			if (match) {
				return tokenConfig.type;
			}
		}

		return undefined;
	}
}