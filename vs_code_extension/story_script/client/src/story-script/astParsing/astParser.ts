import { ICodeToken } from "../api/ICodeToken";
import { IAstNode, IAstNodeString, astFactory, IAstNodeIdentifier, Operators } from "./parsingApi";
import { CodeTokenType } from "../api/CodeTokenType";
import { ISymbolPosition } from "../api/ISymbolPosition";
import { OperationTypes } from "../program/programApi";

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

      let itemResult = astParser.parseItemDeclaration(state);
      if (itemResult) {
        state = itemResult.state;
        content = [
          ...content,
          itemResult.result
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
    const markSequence = [CodeTokenType.Star, CodeTokenType.Plus, CodeTokenType.Space];
    if (!astParser.checkTokenSequence(state, markSequence)) {
      return undefined;
    }

    state = astParser.skipTokens(state, markSequence.length);

    // read import name until '=' sign or end of line
    let alias: IAstNodeString;
    let aliasResult = astParser.readString(state, [CodeTokenType.Endline, CodeTokenType.Equals, CodeTokenType.Colon], true);
    if (aliasResult) {
      state = aliasResult.state;
      alias = aliasResult.result;
    }

    // if found '=' sign, then parse everything as path until end of line
    let path: IAstNode[] = [];
    let nextToken = astParser.getToken(state);
    if (nextToken && nextToken.type === CodeTokenType.Equals) {
      state = astParser.skipTokens(state, 1);

      let pathItemResult: IParseResult<IAstNodeString>;
      while (pathItemResult = astParser.readString(state, [CodeTokenType.Endline, CodeTokenType.Slash], true)) {
        state = pathItemResult.state;
        path = [
          ...path,
            pathItemResult.result
        ]

        nextToken = astParser.getToken(state);
        if (nextToken.type === CodeTokenType.Endline) {
          break;
        }

        state = astParser.skipTokens(state, 1);
      }

    }

    if (astParser.checkTokenSequence(state, [CodeTokenType.Endline])) {
      state = astParser.skipTokens(state, 1);
    }

    const result = astFactory.createImport(alias, path);
    return {
      state, 
      result,
    }
  },

  parseItemDeclaration: (state: IParserState): IParseResult<IAstNode> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    // read item mark *+
    const markSequence = [CodeTokenType.Star, CodeTokenType.Space];
    if (!astParser.checkTokenSequence(state, markSequence)) {
      return undefined;
    }

    state = astParser.skipTokens(state, markSequence.length);

    // read item name name until '=' sign or end of line
    let name: IAstNode;
    let nameResult = astParser.readString(state, [CodeTokenType.Endline, CodeTokenType.Equals, CodeTokenType.Colon], true);
    if (nameResult) {
      state = nameResult.state;
      name = astFactory.createIdentifier(nameResult.result.value, nameResult.result.start, nameResult.result.end);
    }

    // if found '=' sign, then parse everything as expression until end of line
    let value: IAstNode;
    let nextToken = astParser.getTokenOfType(state, [CodeTokenType.Equals]);
    if (nextToken) {
      state = astParser.skipTokens(state, 1);
      
      const expressionResult = astParser.readExpression(state, false)
      if (expressionResult) {
        state = expressionResult.state;
        value = expressionResult.result;
      }
    }

    const result = astFactory.createOperation(Operators.equals, name, value, name.start, value.end);
    return {
      state,
      result,
    }
  },

  readString: (state: IParserState, breakTokens: CodeTokenType[], trimString: boolean = false): IParseResult<IAstNodeString> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    let result: string;
    let startPos: ISymbolPosition;
    let endPos: ISymbolPosition;
    let nextToken: ICodeToken;
    let offset = 0;

    while (nextToken = astParser.getToken(state, offset)) {
      if (!nextToken) {
        break;
      }

      if (breakTokens.indexOf(nextToken.type) >= 0) {
        break;
      }

      if (!result) {
        // first token
        startPos = nextToken.start;
        endPos = nextToken.end;
        result = nextToken.value;
      }
      else {
        result = result + nextToken.value;
        endPos = nextToken.end;
      }

      offset++;
    }

    if (!result) {
      return undefined;
    }

    state = astParser.skipTokens(state, offset);

    if (trimString) {
      result = result.trim();
    }

    if (!result) {
      return undefined;
    }

    const resultNode = astFactory.createString(result, startPos, endPos);

    return {
      result: resultNode,
      state
    }
  },

  readExpression: (state: IParserState, multiline: boolean = false): IParseResult<IAstNode> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    // can be scope, operation or identifier
    let identifier: IAstNodeIdentifier;
    const identifierResult = astParser.readIdentifier(state);
    if (identifierResult) {
      state = identifierResult.state;
      identifier = identifierResult.result;
    }

    let leftSide = identifier;

    // read operand. if so, we have an operation
    state = astParser.skipWhitespace(state, multiline);

    // read operation type
    const opTypeResult = astParser.readOperationType(state, multiline);
    if (opTypeResult) {
      // we have an operation
      state = opTypeResult.state;
      const opType = opTypeResult.result;

      // read right side as exression
      const rightSideResult = astParser.readExpression(state, multiline);
      let rightSide: IAstNode;
      if (rightSideResult) {
        state = rightSideResult.state;
        rightSide = rightSideResult.result;
      }

      const operation = astFactory.createOperation(opType, leftSide, rightSide, leftSide.start, rightSide.end);
      return {
        state, 
        result: operation
      }
    }

    if (leftSide) {
      return {
        state, 
        result: leftSide
      }
    }
  },

  readIdentifier: (state: IParserState): IParseResult<IAstNodeIdentifier> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    state = astParser.skipWhitespace(state)
    // identifier is a word
    let token = astParser.getTokenOfType(state, [CodeTokenType.Word]);
    if (!token) {
      return undefined;
    }

    state = astParser.skipTokens(state, 1);

    const result = astFactory.createIdentifier(token.value, token.start, token.end);
    return {
      state, 
      result
    }
  },
  readOperationType: (state: IParserState, multiline: boolean = false): IParseResult<Operators> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    state = astParser.skipWhitespace(state, multiline);
    // operation mark may be . + - / * > < =
    let token = astParser.getToken(state);
    if (!token) {
      return undefined;
    }

    for (let key in Operators) {
      const operator = Operators[key];
      if (token.value === operator) {
        state = astParser.skipTokens(state, 1);

        return {
          state,
          result: operator as Operators,
        }
      }
    }

    return undefined;
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

  skipWhitespace: (state: IParserState, multiline: boolean = false): IParserState => {
    const tokenTypes = multiline 
      ? [CodeTokenType.Space, CodeTokenType.Whitespace, CodeTokenType.Endline] 
      : [CodeTokenType.Space, CodeTokenType.Whitespace];
    return astParser.skipTokensOfType(state, tokenTypes);
  },
  skipTokensOfType: (state: IParserState, tokenTypes: CodeTokenType[]): IParserState => {
    if (astParser.isEndOfFile(state)) {
      return state;
    }

    if (!tokenTypes || tokenTypes.length <= 0) {
      return state;
    }

    let nextToken: ICodeToken;
    while (nextToken = astParser.getToken(state)) {
      if (tokenTypes.indexOf(nextToken.type) < 0) {
        return state;
      }

      state = astParser.skipTokens(state, 1);
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
  getTokenOfType: (state: IParserState, types: CodeTokenType[], offset: number = 0): ICodeToken => {
    if (astParser.isEndOfFile(state, offset)) {
      return undefined;
    }

    const cursor = state.cursor + offset;
    if (cursor < 0) {
      return undefined;
    }

    const token = state.tokens[cursor];
    if (!token) {
      return undefined;
    }

    if (types.indexOf(token.type) < 0) {
      return undefined;
    }

    return token;
  },

  isEndOfFile: (state: IParserState, offset: number = 0): boolean => {
    if (!state || !state.tokens || state.tokens.length <= 0) {
      return true;
    }

    const cursor = state.cursor + offset;
    return state.tokens.length <= cursor;
  }
}