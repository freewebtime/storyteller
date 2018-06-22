import { ICodeToken } from "../api/ICodeToken";
import { IAstNode, IAstNodeString, astFactory, IAstNodeIdentifier, Operators, IAstNodeSequence, IAstNodeOperation } from "./parsingApi";
import { CodeTokenType } from "../api/CodeTokenType";
import { ISymbolPosition } from "../api/ISymbolPosition";

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

      let itemResult = astParser.parseItem(state, 0);
      if (itemResult) {
        state = itemResult.state;
        content = [
          ...content,
          itemResult.result
        ]

        continue;
      }

      let templResult = astParser.parseTemplateItem(state, 0);
      if (templResult) {
        state = templResult.state;
        content = [
          ...content,
          templResult.result
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

  parseItem: (state: IParserState, indent: number, parent?: IAstNode[]): IParseResult<IAstNode> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    // check indent
    let checkIndent = astParser.checkIndent(state, indent);
    if (!checkIndent) {
      return undefined;
    }

    state = checkIndent.state;

    // read item mark *+
    const markSequence = [CodeTokenType.Star, CodeTokenType.Space];
    if (!astParser.checkTokenSequence(state, markSequence)) {
      return undefined;
    }

    state = astParser.skipTokens(state, markSequence.length);

    let start: ISymbolPosition;
    let end: ISymbolPosition;

    // read item name name until '=' sign or end of line
    let name: IAstNode;
    let nameResult = astParser.readString(state, [CodeTokenType.Endline, CodeTokenType.Equals, CodeTokenType.Colon], true);
    if (nameResult) {
      state = nameResult.state;
      name = astFactory.createIdentifier(nameResult.result, nameResult.result.start, nameResult.result.end);
    
      start = name.start;
      end = name.end;
    }

    // if found '=' sign, then parse everything as expression until end of line
    let value: IAstNode;
    let equalsToken = astParser.getTokenOfType(state, [CodeTokenType.Equals]);
    if (equalsToken) {
      state = astParser.skipTokens(state, 1);
      
      const expressionResult = astParser.parseExpression(state, false)
      if (expressionResult) {
        state = expressionResult.state;
        value = expressionResult.result;
      
        end = value.end;
      }
    }

    let nameNode: IAstNode = name;
    if (parent) {
      nameNode = astFactory.createSequence([...parent, name]);
    }

    let construct = astFactory.createOperation(Operators.equals, nameNode, value, start, end);

    // find all subitems
    let subitems: IAstNode[];
    let subitemResult: IParseResult<IAstNode>;
    let subitemParent: IAstNode[];
    if (parent) {
      subitemParent = [...parent, name]
    }
    else {
      subitemParent = [name]
    }

    while (subitemResult = astParser.parseSubitem(state, indent + 1, subitemParent)) {
      if (!subitems) {
        subitems = [];
      }

      state = subitemResult.state;

      subitems = [
        ...subitems,
        subitemResult.result
      ]
    }

    let result: IAstNode = construct;

    // create constructor
    if (subitems) {
      // we have subitems, so result will be a sequence (program)
      const prog = [construct, ...subitems];
      result = astFactory.createSequence(prog);
    }
    
    return {
      state,
      result,
    }
  },
  parseSubitem: (state: IParserState, targetIndent: number, parent: IAstNode[]): IParseResult<IAstNode> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    state = astParser.skipWhitespace(state);
    let endlineToken: ICodeToken;
    while (endlineToken = astParser.getTokenOfType(state, [CodeTokenType.Endline])) {
      state = astParser.skipTokens(state, 1);
      let sState = astParser.skipWhitespace(state, false);
      const nextToken = astParser.getTokenOfType(sState, [CodeTokenType.Endline]);
      if (!nextToken) {
        break;
      }

      state = sState;
    }

    const subitemResult = astParser.parseItem(state, targetIndent, parent);
    if (subitemResult) {
      state = subitemResult.state;
      let result = subitemResult.result;

      return {
        state: state,
        result: result,
      };
    }

    const templateItemResult = astParser.parseTemplateItem(state, targetIndent, parent);
    if (templateItemResult) {
      state = templateItemResult.state;
      let result = templateItemResult.result;

      return {
        state: state,
        result: result,
      };
    }

    return undefined;
  },
  
  parseTemplateItem: (state: IParserState, targetIndent: number = 0, parent?: IAstNode[]): IParseResult<IAstNode> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    // check indent
    let checkIndent = astParser.checkIndent(state, targetIndent);
    if (!checkIndent) {
      return undefined;
    }
    state = checkIndent.state;

    let items: IAstNode[] = [];
    // read everything as string until mention mark or endline
    let stringResult: IParseResult<IAstNodeString>; 
    let start: ISymbolPosition;
    let end: ISymbolPosition;
    while (!astParser.getTokenOfType(state, [CodeTokenType.Endline]))
    {
      stringResult = astParser.readString(state, [CodeTokenType.Star, CodeTokenType.Endline])
      if (stringResult) {
        if (items.length === 0) {
          start = stringResult.result.start;
        }

        items = [
          ...items,
          stringResult.result
        ]
        end = stringResult.result.end;
        state = stringResult.state;
      }

      // if we stopped at mention mark, parse mention
      if (astParser.getTokenOfType(state, [CodeTokenType.Star])) {

        let mentionResult: IParseResult<IAstNode> = astParser.parseMention(state, false);
        if (mentionResult) {
          state = mentionResult.state;
          // add mention
          items = [
            ...items,
            mentionResult.result
          ]
        }

        continue;
      }

      // otherwise it's endline
      break;
    }

    if (items.length === 0) {
      return undefined;
    }

    let nameNode: IAstNode;
    if (parent) {
      if (parent.length === 1){
        nameNode = parent[0];
      } 
      else {
        nameNode = astFactory.createSequence(parent);
      }
    }

    let value: IAstNode;
    if (items.length === 1) {
      value = items[0];
    } 
    else {
      value = astFactory.createSequence(items);
    }

    let addOperation = astFactory.createOperation(Operators.add, nameNode, value, start, end);

    return {
      state, 
      result: addOperation
    }
  },

  parseMention: (state: IParserState, multiline: boolean): IParseResult<IAstNodeOperation> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    // check star symbol
    let starToken = astParser.getTokenOfType(state, [CodeTokenType.Star]);
    if (!starToken) {
      return undefined;
    }
    state = astParser.skipTokens(state, 1);

    let expressionResult = astParser.parseExpression(state, multiline);
    if (expressionResult) {
      state = expressionResult.state;

      // mention is a get operation
      let expression = expressionResult.result;

      let start = starToken.start;
      let end = expression.end;

      let left: IAstNode = expression;
      let right: IAstNode;

      let operation = astFactory.createOperation(Operators.get, left, right, start, end);
      return {
        state,
        result: operation
      }
    }
    
    return undefined;
  },

  checkIndent: (state: IParserState, targetIndent: number): IParseResult<IAstNodeString> => {
    // check indent
    let whitespace: IAstNodeString;
    let indent = 0;
    const whitespaceResult = astParser.readWhitespace(state);
    if (whitespaceResult) {
      state = whitespaceResult.state;
      whitespace = whitespaceResult.result;
      indent = whitespace.value.length / 2;
    }

    if (indent < targetIndent) {
      return undefined;
    }

    return {
      state,
      result: whitespace
    };
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

  parseExpression: (state: IParserState, multiline: boolean = false): IParseResult<IAstNode> => {
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

    // search for operator and right side
    let state1 = astParser.skipWhitespace(state, multiline);

    // read operation type
    const opTypeResult = astParser.readOperationType(state1, multiline);
    if (opTypeResult) {
      // we have an operation
      state = opTypeResult.state;
      const opType = opTypeResult.result;

      // read right side as exression
      const rightSideResult = astParser.parseExpression(state, multiline);
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

    return undefined;
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

    const name: IAstNode = astFactory.createString(token.value, token.start, token.end);
    const result = astFactory.createIdentifier(name, name.start, name.end);
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

  // single line!
  readWhitespace: (state: IParserState) => {
    return astParser.readTokensAsString(state, [CodeTokenType.Space]);
  },

  readTokensAsString: (state: IParserState, tokenTypes: CodeTokenType[]): IParseResult<IAstNodeString> => {
    let start: ISymbolPosition;
    let end: ISymbolPosition;
    let value: string;    
    let nextToken: ICodeToken;

    while (nextToken = astParser.getTokenOfType(state, tokenTypes)) {
      if (!value) {
        start = nextToken.start;
        end = nextToken.end;
        value = nextToken.value;
      } 
      else {
        end = nextToken.end;
        value = value + nextToken.value;
      }

      state = astParser.skipTokens(state, 1);
    }

    if (value) {
      const result = astFactory.createString(value, start, end);
      return {
        state,
        result,
      }
    }

    return undefined;
  },
  skipWhitespace: (state: IParserState, multiline: boolean = false): IParserState => {
    const tokenTypes = multiline 
      ? [CodeTokenType.Space, CodeTokenType.Endline] 
      : [CodeTokenType.Space];
    return astParser.skipTokensOfType(state, tokenTypes);
  },
  skipTokenOfType: (state: IParserState, tokenTypes: CodeTokenType[]): IParserState => {
    let nextToken = astParser.getTokenOfType(state, tokenTypes);
    if (nextToken) {
      state = astParser.skipTokens(state, 1);
    }

    return state;
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
  skipUntil: (state: IParserState, tokenTypes: CodeTokenType[]): IParserState => {
    if (astParser.isEndOfFile(state)) {
      return state;
    }

    if (!tokenTypes || tokenTypes.length <= 0) {
      return state;
    }

    let nextToken: ICodeToken;
    while (nextToken = astParser.getToken(state)) {
      if (tokenTypes.indexOf(nextToken.type) >= 0) {
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