import { ISymbolPosition } from "../api/ISymbolPosition";
import { ICodeToken } from "../api/ICodeToken";
import { stsConfig, ITokenConfig, IOperationConfig } from "./stsConfig";
import { CodeTokenType } from "../api/CodeTokenType";
import { IAstNode, AstNodeType, IAstNodeText, IAstNodeOperation, IAstNodeVariable, IAstNodeReference, OperationType } from "../api/IAstNode";

export interface ITokenizerState {
	sourceCode: string;
	cursor: ISymbolPosition;
	globalCursor: number;
	tokens: ICodeToken[];
}

export const stsTokenizer = {
  tokenizeCode: (sourceCode: string): ICodeToken[] => {
		let state: ITokenizerState = {
			sourceCode: sourceCode,
			cursor: {
				line: 0, 
				symbol: 0
			},
			globalCursor: 0,
			tokens: [],
		};

		let nextToken: ICodeToken;
		while (nextToken = stsTokenizer.getNextToken(state, CodeTokenType.Word)) {
			state = stsTokenizer.addToken(state, nextToken);
		}

		return state.tokens;
	},

	getNextToken: (state: ITokenizerState, fallbackTokenType: CodeTokenType, pattern?: string): ICodeToken => {
    if (stsTokenizer.isEndOfFile(state)) {
      return undefined;
    }
    
    pattern = pattern || stsConfig.allSeparatorsPattern;
    pattern = stsConfig.wrapPatternWithCursorPos(pattern, state.globalCursor);
		const regexp = new RegExp(pattern);

    const ln = state.sourceCode.length;

		let match = regexp.exec(state.sourceCode);
    let searchIndex: number = match ? match.index : 0;
    if (!match) {
      
      if (state.globalCursor < state.sourceCode.length) {
        //check is it last token in file
        let pattern2 = `(?:.|\\r|\\n){${state.globalCursor}}(.*)`;
        match = new RegExp(pattern2).exec(state.sourceCode);
      }
      
      if (!match) {
        return undefined;
      }
    }
    
		let tokenLength: number;
		let tokenValue: string;
		let tokenType: CodeTokenType;

		if (searchIndex === 0) {
      tokenValue = match[0].substr(state.globalCursor);
			tokenType = stsConfig.getTokenType(tokenValue) || fallbackTokenType;
			tokenLength = tokenValue.length;
		}
		
		if (!tokenValue) {
			//token type is fallbackTokenType
			tokenLength = searchIndex;
      tokenValue = state.sourceCode.substr(state.globalCursor, tokenLength) || '';
			tokenType = fallbackTokenType;
		}

		const start = { ...state.cursor }
		const end = {
			...start,
			symbol: start.symbol + tokenLength,
		};

		let token: ICodeToken = {
			type: tokenType,
			value: tokenValue,
			start,
			end,
			length: tokenLength,
		};

		return token;
	},

	addToken: (state: ITokenizerState, token: ICodeToken): ITokenizerState => {
		const tokens = [
			...state.tokens,
			token,
		];
		const tokenLenght = token.end.symbol - token.start.symbol;
		const globalCursor = state.globalCursor + tokenLenght;
		let cursor: ISymbolPosition = {...state.cursor};

		if (token.type === CodeTokenType.Endline) {
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
  },
  
  skipWhitespace: (state: ITokenizerState, skipEndline: boolean = true): ITokenizerState => {
    let nextToken: ICodeToken;
    while (nextToken = stsTokenizer.getNextToken(state, CodeTokenType.Word)) {
      if (nextToken.type === CodeTokenType.Endline && skipEndline) {
        state = stsTokenizer.addToken(state, nextToken);
        continue;
      }

      if (nextToken.type === CodeTokenType.Space || nextToken.type === CodeTokenType.Whitespace) {
        state = stsTokenizer.addToken(state, nextToken);
        continue;
      }
      
      break;
    }

    return state;
  },

  isEndOfFile: (state: ITokenizerState): boolean => {
    return !state.sourceCode || state.globalCursor >= state.sourceCode.length;
  }
}