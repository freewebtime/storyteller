import { ICodeToken } from "../api/ICodeToken";
import { IAstNode, IAstNodeString, astFactory } from "./parsingApi";
import { CodeTokenType } from "../api/CodeTokenType";
import { IAstNodeText } from "../api/IAstNode";

interface IParserState {
  tokens: ICodeToken[];
  cursor: number;
}

interface IParseResult<TResult = any> {
  state: IParserState;
  result: TResult;
}

export const astParser = {

  parse: (tokens: ICodeToken[]): IAstNode => {
    let state: IParserState = {
      tokens: tokens,
      cursor: 0,
    };

    let content: IAstNode[] = [];

    while (!astParser.isEndOfFile(state)) {
      let importItem = astParser.parseImport(state);
      if (importItem) {
        state = importItem.state;
        content = [
          ...content,
          importItem.result
        ]

        continue;
      }

      state = astParser.skipTokens(state, 1);
    }

    const result = astFactory.createSequence(content);
    return result;
  },

  parseImport: (state: IParserState): IParseResult<IAstNode> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    // read import mark *+
    const markSequence = [CodeTokenType.Star, CodeTokenType.Plus];
    if (!astParser.checkTokenSequence(state, markSequence)) {
      return undefined;
    }

    state = astParser.skipTokens(state, markSequence.length);

    // read import name until '=' sign or end of line
    let alias = '';
    let nextToken: ICodeToken;

    while (nextToken = astParser.getToken(state)) {
      state = astParser.skipTokens(state, 1);
      if (nextToken.type === CodeTokenType.Endline
        || nextToken.type === CodeTokenType.Equals
        || nextToken.type === CodeTokenType.Colon
      ) {
        break;
      }

      alias = alias + nextToken.value;
    }

    alias = alias.trim();

    // if found '=' sign, then parse everything as path until end of line
    let path: IAstNode[] = [];
    if (nextToken && nextToken.type === CodeTokenType.Equals) {

      let pathBuffer: string;

      while (nextToken = astParser.getToken(state)) {
        state = astParser.skipTokens(state, 1);

        if (nextToken.type === CodeTokenType.Slash) {
          if (pathBuffer) {
            const pathItem = astFactory.createString(pathBuffer);

            path = [
              ...path,
              pathItem
            ]
          }

          pathBuffer = undefined;

          continue;
        }

        if (nextToken.type === CodeTokenType.Endline) {
          break;
        }

        pathBuffer = (pathBuffer || '') + nextToken.value;
        continue;
      }
    }

    const result = astFactory.createImport(alias, path);
    return {
      state, 
      result,
    }

  },

  skipTokens: (state: IParserState, tokensCount: number): IParserState => {
    if (astParser.isEndOfFile(state)) {
      if (tokensCount === 0)
        return state;

      return undefined;
    }

    const cursor = state.cursor + tokensCount;
    if (state.tokens.length <= cursor) {
      return undefined;
    }

    state = {
      ...state,
      cursor: cursor,
    }

    return state;
  },

  checkTokenSequence: (state: IParserState, tokenTypes: CodeTokenType[]): boolean => {
    if (astParser.isEndOfFile(state)) {
      return false;
    }

    if (!tokenTypes || tokenTypes.length <= 0) {
      return true;
    }

    for (let i = 0; i < tokenTypes.length; i++) {
      const tokenType = tokenTypes[i];
      const token = astParser.getToken(state, i);
      if (!token || token.type !== tokenType) {
        // broken sequence
        return undefined;
      }
    }

    return true;
  },

  getToken: (state: IParserState, offset: number = 0): ICodeToken => {
    if (astParser.isEndOfFile(state, offset)) {
      return undefined;
    }

    const cursor = state.cursor + offset;
    if (cursor < 0) {
      return undefined;
    }

    return state.tokens[cursor];
  },

  isEndOfFile: (state: IParserState, offset: number = 0): boolean => {
    if (!state || !state.tokens || state.tokens.length <= 0) {
      return true;
    }

    const cursor = state.cursor + offset;
    return state.tokens.length <= cursor;
  }
}