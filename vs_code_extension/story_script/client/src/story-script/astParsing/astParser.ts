import { ICodeToken } from "../api/ICodeToken";
import { IAstNode, IAstNodeString, astFactory, IAstNodeIdentifier, Operators, IAstNodeProgram, IAstNodeCall, IAstNodeArray, IAstNodeImport, IParsingError, IAstNodeObject, IAstNodeModule, IAstNodeMention } from "./parsingApi";
import { CodeTokenType } from "../api/CodeTokenType";
import { ISymbolPosition } from "../api/ISymbolPosition";
import { IHash } from "../../shared/IHash";

interface IParserState {
  tokens: ICodeToken[];
  cursor: number;
}

interface IParseResult<TResult = any> {
  state: IParserState;
  result: TResult;
}

export const astParser = {

  parseModule: (tokens: ICodeToken[], moduleName: string): { result: IAstNodeModule, errors: IParsingError[] } => {
    let state: IParserState = 
    {
      tokens: tokens,
      cursor: 0,
    };

    let errors: IParsingError[] = [];
    let body: IAstNode[] = [];

    while (!astParser.isEndOfFile(state)) {
      let subitemResult = astParser.parseSubitem(state, 0);
      if (subitemResult) {
        state = subitemResult.state;
        let subitem = subitemResult.result;

        body = astParser.addItemToArray(body, subitem);
        continue;
      }

      state = astParser.skipTokens(state, 1);
    }

    let start: ISymbolPosition = { line: 0, symbol: 0 }
    let end: ISymbolPosition = { line: 0, symbol: 0 }

    if (body.length > 0) {
      end = body[body.length - 1].end;
    }

    const program = astFactory.createProgram(body, start, end);
    const result = astFactory.createModule(program, moduleName, start, end);
    return {
      errors,
      result
    }
  },

  parseImport: (state: IParserState, targetIndent: number): IParseResult<IAstNodeImport> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    // check whitespace
    if (!astParser.checkIndent(state, targetIndent)) {
      return undefined;
    }

    // read import mark *+
    const markSequence = [CodeTokenType.Star, CodeTokenType.Plus, CodeTokenType.Space];
    if (!astParser.checkTokenSequence(state, markSequence)) {
      return undefined;
    }

    let start: ISymbolPosition = astParser.getCursorPosition(state);
    let end: ISymbolPosition = {
      ...start, 
      symbol: start.symbol + markSequence.length
    };

    state = astParser.skipTokens(state, markSequence.length);

    // read import name until '=' sign or end of line
    let name: IAstNodeString;
    let nameResult = astParser.readString(state, [CodeTokenType.Endline, CodeTokenType.Equals], true);
    if (nameResult) {
      state = nameResult.state;
      name = nameResult.result;

      end = name.end || end;
    }

    // if found '=' sign, then parse everything as path until end of line
    let path: IAstNodeString;
    let nextToken = astParser.getToken(state);
    if (nextToken && nextToken.type === CodeTokenType.Equals) {
      state = astParser.skipTokens(state, 1);

      // we've skipped = sign
      const pathResult = astParser.readString(state, [CodeTokenType.Endline], true);
      if (pathResult) {
        path = pathResult.result;
        end = path.end || end;
      
        state = pathResult.state;
      }
    }

    // skip endline if any
    if (astParser.getTokenOfType(state, [CodeTokenType.Endline])) {
      state = astParser.skipTokens(state, 1);
    }

    const result = astFactory.createImport(name, path, targetIndent, start, end);
    return {
      state, 
      result,
    }
  },

  parseVariable: (state: IParserState, targetIndent: number): IParseResult<IAstNode> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    // check indent
    let checkIndent = astParser.checkIndent(state, targetIndent);
    if (!checkIndent) {
      return undefined;
    }

    state = checkIndent.state;

    // read item mark * 
    const markSequence = [CodeTokenType.Star, CodeTokenType.Space];
    if (!astParser.checkTokenSequence(state, markSequence)) {
      return undefined;
    }

    let start: ISymbolPosition = astParser.getCursorPosition(state);
    let end: ISymbolPosition = {...start, symbol: start.symbol + markSequence.length};

    state = astParser.skipTokens(state, markSequence.length);

    // read item name name until : or end of line
    let name: IAstNodeString;
    let nameResult = astParser.readString(state, [CodeTokenType.Endline, CodeTokenType.Colon], true);
    if (nameResult) {
      state = nameResult.state;
      name = nameResult.result;

      start = name.start || start;
      end = name.end || end;
    }

    // read var type
    let varType: IAstNodeString;

    // check if we stopped on colon
    if (astParser.checkTokenSequence(state, [CodeTokenType.Colon])) {
      state = astParser.skipTokens(state, 1);

      end = astParser.getCursorPosition(state);

      // read type
      let varTypeResult = astParser.readString(state, [CodeTokenType.Endline], true);
      if (varTypeResult) {
        varType = varTypeResult.result;
        state = varTypeResult.state;

        end = varType.end || end;
      }
    }

    // check variable value
    let varValue: IAstNodeArray;

    // skip endline
    if (astParser.checkTokenSequence(state, [CodeTokenType.Endline])) {
      state = astParser.skipTokens(state, 1);

      // find all subitems
      let parseSubitemResult: IParseResult;
      let varValueLines: IAstNode[];
      let varValueStart: ISymbolPosition = astParser.getCursorPosition(state);
      while (parseSubitemResult = astParser.parseSubitem(state, targetIndent + 1)) {
        let subitem = parseSubitemResult.result;
        state = parseSubitemResult.state;

        end = subitem.end || end;

        varValueLines = varValueLines || [];
        varValueLines = astParser.addItemToArray(varValueLines, subitem);

        if (astParser.getTokenOfType(state, [CodeTokenType.Endline])) {
          state = astParser.skipTokens(state, 1);
        }
      }

      if (varValueLines) {
        varValue = astFactory.createArray(varValueLines, varValueStart, end);
      }
    }

    let result = astFactory.createVariable(name, varType, varValue, targetIndent, start, end);
    
    return {
      state,
      result,
    }
  },

  parseSubitem: (state: IParserState, targetIndent: number): IParseResult<IAstNode> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    const importResult = astParser.parseImport(state, targetIndent);
    if (importResult) {
      return importResult;
    }

    const variableResult = astParser.parseVariable(state, targetIndent);
    if (variableResult) {
      return variableResult;
    }

    const textLineResult = astParser.parseTextLine(state, targetIndent);
    if (textLineResult) {
      return textLineResult;
    }

    return undefined;
  },

  parseTextLine: (state: IParserState, targetIndent: number): IParseResult<IAstNodeString> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    if (!astParser.checkIndent(state, targetIndent)) {
      return undefined;
    }

    let lineResult = astParser.readString(state, [CodeTokenType.Endline]);
    return lineResult;
  },


  parseLiteralContent: (state: IParserState, multiline: boolean, breakOnQuote: boolean): IParseResult<IAstNode[]> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    let items: IAstNode[] = [];
    // read everything as string until mention mark or endline
    let stringResult: IParseResult<IAstNodeString>;
    let start: ISymbolPosition;
    let end: ISymbolPosition;
    let stopTokens = breakOnQuote ? [CodeTokenType.Quote, CodeTokenType.Endline] : [CodeTokenType.Endline];
    
    while (!astParser.getTokenOfType(state, stopTokens)) {
      
      // parse string
      let splitTokens = breakOnQuote ? [CodeTokenType.Star, CodeTokenType.Endline, CodeTokenType.Quote] : [CodeTokenType.Star, CodeTokenType.Endline];
      stringResult = astParser.readString(state, splitTokens)
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
      
        continue;
      }

      // parse mention
      let mentionResult: IParseResult<IAstNode> = astParser.parseMention(state, multiline);
      if (mentionResult) {
        state = mentionResult.state;
        // add mention
        items = [
          ...items,
          mentionResult.result
        ]

        continue;
      }

      // otherwise it's endline
      break;
    }

    return {
      state,
      result: items
    }
  },
  parseScope: (state: IParserState, multiline: boolean): IParseResult<IAstNodeProgram> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    // starts with ( and ends with )
    let openToken = astParser.getTokenOfType(state, [CodeTokenType.ParenOpen]);
    if (!openToken) {
      return undefined;
    }
    state = astParser.skipTokens(state, 1);

    let start = openToken.start;
    let end = openToken.end;

    let itemsResult = astParser.parseScopeContent(state, multiline);
    let items: IAstNode[] = [];
    if (itemsResult) {
      items = itemsResult.result;
      state = itemsResult.state;
    }

    if (items.length > 0) {
      end = items[items.length - 1].end;
    }

    // skip closing paren
    if (astParser.getTokenOfType(state, [CodeTokenType.ParenClose])) {
      state = astParser.skipTokens(state, 1);
    }

    let result = astFactory.createProgram(items, start, end);

    return {
      state, 
      result
    }
  },

  parseScopeContent: (state: IParserState, multiline: boolean): IParseResult<IAstNode[]> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    let items: IAstNode[] = [];
    // read everything as exressions until )
    while (!astParser.getTokenOfType(state, [CodeTokenType.ParenClose])) {
      let expressionResult = astParser.parseExpression(state, multiline, true);
      if (expressionResult) {
        items = [
          ...items,
          expressionResult.result
        ]

        state = expressionResult.state;

        continue;
      }

      let endlineToken = astParser.getTokenOfType(state, [CodeTokenType.Endline]);
      if (endlineToken) {
        if (multiline) {
          state = astParser.skipTokens(state, 1);
          continue;
        }

        // it's not multiline scope, and we've found endline token
        break;
      }

      if (astParser.getTokenOfType(state, [CodeTokenType.Space])) {
        state = astParser.skipWhitespace(state, multiline);
        continue;
      }

      state = astParser.skipTokens(state, 1);
    }

    if (astParser.getTokenOfType(state, [CodeTokenType.ParenClose])) {
      state = astParser.skipTokens(state, 1);
    }

    return {
      state, 
      result: items
    }
  },

  parseLiteral: (state: IParserState, multiline: boolean): IParseResult<IAstNodeArray> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    // starts with " and ends with "
    let openToken = astParser.getTokenOfType(state, [CodeTokenType.Quote]);
    if (!openToken) {
      return undefined;
    }
    state = astParser.skipTokens(state, 1);

    let start = openToken.start;
    let end = openToken.end;

    let items: IAstNode[] = [];
    // read everything as exressions until "
    while (!astParser.getTokenOfType(state, [CodeTokenType.Quote])) {
      if (astParser.isEndOfFile(state)) {
        break;
      }
      
      let contentResult: IParseResult<IAstNode[]>;
      while (contentResult = astParser.parseLiteralContent(state, multiline, true)) {
        state = contentResult.state;
        let contentItems = contentResult.result;

        if (contentItems.length <= 0) {
          continue;
        }

        if (items.length === 0) {
          start = contentItems[0].start;
        }

        end = contentItems[contentItems.length - 1].end;

        items = [
          ...items,
          ...contentItems
        ]

        continue;
      }

      // break on quote
      if (astParser.getTokenOfType(state, [CodeTokenType.Quote])) {
        state = astParser.skipTokens(state, 1);
        break;
      }

      // check is multiline
      let endlineToken = astParser.getTokenOfType(state, [CodeTokenType.Endline]);
      if (endlineToken) {
        if (multiline) {
          state = astParser.skipTokens(state, 1);
          continue;
        }

        // it's not multiline scope, and we've found endline token
        break;
      }
    }

    // if we stopped on quote, skip it
    if (astParser.getTokenOfType(state, [CodeTokenType.Quote])) {
      state = astParser.skipTokens(state, 1);
    }

    let result = astFactory.createArray(items, start, end);
    return {
      state,
      result
    }
  },
  
  parseOuterTemplate: (state: IParserState, targetIndent: number = 0, parent?: IAstNode[]): IParseResult<IAstNode> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    // check indent
    let checkIndent = astParser.checkIndent(state, targetIndent);
    if (!checkIndent) {
      return undefined;
    }
    state = checkIndent.state;

    let start: ISymbolPosition;
    let end: ISymbolPosition;

    let nameNode: IAstNode;
    if (parent) {
      if (parent.length === 1){
        nameNode = parent[0];
      } 
      else {
        nameNode = astFactory.createProgram(parent);
      }

      start = nameNode.start;
      end = nameNode.end;
    }

    let content: IAstNode[];
    let contentResult = astParser.parseLiteralContent(state, true, false);
    if (contentResult) {
      state = contentResult.state;
      content = contentResult.result;
      
      if (content.length > 0) {
        if (!start) {
          start = content[0].start;
        }

        end = content[content.length - 1].end;
      }
    }

    if (!nameNode && content.length <= 0) {
      return undefined;
    }

    let contentStart = content[0].start;
    let contentEnd = content[0].end;

    let contentNode = astFactory.createArray(content, contentStart, contentEnd);
    let addOperation = astFactory.createOperation(Operators.add, nameNode, contentNode, start, end);

    return {
      state, 
      result: addOperation
    }
  },

  parseMention: (state: IParserState, multiline: boolean): IParseResult<IAstNodeMention> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    return undefined;

    // check star symbol
    let starToken = astParser.getTokenOfType(state, [CodeTokenType.Star]);
    if (!starToken) {
      return undefined;
    }
    state = astParser.skipTokens(state, 1);

    let start = starToken.start;
    let result: IAstNodeMention;

    // parse call
    let callResult = astParser.parseCall(state, true, false);
    if (callResult) {
      state = callResult.state;

      let call = callResult.result;
      let end = call.end;

      result = astFactory.createMention(call, start, end);

      if (astParser.getTokenOfType(state, [CodeTokenType.Semicolon])) {
        state = astParser.skipTokens(state, 1);
      }

      return {
        state, 
        result
      }
    }

    // parse identifier
    let identifierResult = astParser.parseIdentifier(state, false);
    if (identifierResult) {
      state = identifierResult.state;

      let identifier = identifierResult.result;
      let end = identifier.end;

      result = astFactory.createMention(identifier, start, end);

      if (astParser.getTokenOfType(state, [CodeTokenType.Semicolon])) {
        state = astParser.skipTokens(state, 1);
      }

      return {
        state,
        result
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

    if (indent != targetIndent) {
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

  parseExpression: (state: IParserState, multiline: boolean, skipSpace: boolean): IParseResult<IAstNode> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    // left operand
    let leftOperandResult = astParser.parseOperand(state, multiline, skipSpace);
    let leftOperand: IAstNode;
    if (leftOperandResult) {
      leftOperand = leftOperandResult.result;
      state = leftOperandResult.state;
    }

    // operator 
    const operatorResult = astParser.parseOperator(state, multiline, skipSpace);
    if (operatorResult) {
      state = operatorResult.state;
      const operator = operatorResult.result;

      if (skipSpace) {
        state = astParser.skipWhitespace(state, multiline);
      }

      // right operand is an expression
      const rightOperandResult = astParser.parseExpression(state, multiline, skipSpace);
      let rightOperand: IAstNode;
      if (rightOperandResult) {
        state = rightOperandResult.state;
        rightOperand = rightOperandResult.result;
      }

      const operation = astFactory.createOperation(operator, leftOperand, rightOperand, leftOperand.start, rightOperand.end);
      return {
        state, 
        result: operation
      }
    }

    if (leftOperand) {
      return {
        state, 
        result: leftOperand
      }
    }

    return undefined;
  },

  parseOperand: (state: IParserState, multiline: boolean, skipSpace: boolean): IParseResult<IAstNode> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    // can be call, scope, or identifier

    // call
    const callResult = astParser.parseCall(state, multiline, skipSpace);
    if (callResult) {
      return callResult;
    }

    // scope
    const scopeResult = astParser.parseScope(state, multiline);
    if (scopeResult) {
      return scopeResult;
    }

    // identifier
    const identifierResult = astParser.parseIdentifier(state, multiline);
    if (identifierResult) {
      return identifierResult;
    }

    return undefined;
  },

  parseCall: (state: IParserState, multiline: boolean, skipSpace: boolean): IParseResult<IAstNodeCall> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    // identifier
    let identifier: IAstNodeIdentifier;
    const identifierResult = astParser.parseIdentifier(state, multiline);
    if (!identifierResult) {
      return undefined;
    }

    state = identifierResult.state;
    identifier = identifierResult.result;
    let start = identifier.start;
    let end = identifier.end;

    if (skipSpace) {
      state = astParser.skipWhitespace(state, multiline);
    }

    // arguments scope
    // starts with ( and ends with )
    let openToken = astParser.getTokenOfType(state, [CodeTokenType.ParenOpen]);
    if (!openToken) {
      return undefined;
    }
    state = astParser.skipTokens(state, 1);

    end = openToken.end;

    let itemsResult = astParser.parseScopeContent(state, multiline);
    let args: IAstNode[] = [];
    if (itemsResult) {
      args = itemsResult.result;
      state = itemsResult.state;
    }

    if (args.length > 0) {
      end = args[args.length - 1].end;
    }

    if (skipSpace) {
      state = astParser.skipWhitespace(state, multiline);
    }

    // find closing symbol )
    let closeToken = astParser.getTokenOfType(state, [CodeTokenType.ParenClose]);
    if (closeToken) {
      end = closeToken.end;
      state = astParser.skipTokens(state, 1);
    }

    // create call node
    let result = astFactory.createCall(identifier, args)
    return {
      state, 
      result
    }
  },

  parseIdentifier: (state: IParserState, multiline: boolean): IParseResult<IAstNodeIdentifier> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    // identifier is a word or literal
    let name: IAstNode;

    // word
    let token = astParser.getTokenOfType(state, [CodeTokenType.Word]);
    if (token) {
      name = astFactory.createString(token.value, token.start, token.end);
      state = astParser.skipTokens(state, 1);
    }
    else {
      // literal
      const literalResult = astParser.parseLiteral(state, multiline);
      if (literalResult) {
        name = literalResult.result;
        state = literalResult.state;
      }
      else {
        return undefined;
      }
    }

    const result = astFactory.createIdentifier(name, name.start, name.end);
    return {
      state, 
      result
    }
  },
  parseOperator: (state: IParserState, multiline: boolean, skipSpace: boolean): IParseResult<Operators> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    if (skipSpace) {
      state = astParser.skipWhitespace(state, multiline);
    }

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
    if (state.tokens.length < cursor) {
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
  getCursorPosition: (state: IParserState): ISymbolPosition => {
    if (!state) {
      return undefined;
    }

    if (astParser.isEndOfFile(state)) {
      if (state.tokens.length > 0) {
        let lastToken = state.tokens[state.tokens.length - 1];
        return lastToken.start;
      }
    }

    const nextToken = astParser.getToken(state);
    return nextToken.start;
  },

  isEndOfFile: (state: IParserState, offset: number = 0): boolean => {
    if (!state || !state.tokens || state.tokens.length <= 0) {
      return true;
    }

    const cursor = state.cursor + offset;
    return state.tokens.length <= cursor;
  },

  addParsingError: (errors: IParsingError[], position: ISymbolPosition, message: string): IParsingError[] => {
    return astParser.addItemToArray(errors, astFactory.createParsingError(position, message));
  },
  addItemToArray: <T = any>(source: T[], item: T): T[] => {
    source = source || [];
    return [
      ...source,
      item
    ]
  },
  addItemToHash: <T = any>(source: IHash<T>, key: string, item: T): IHash<T> => {
    source = source || {};
    return {
      ...source,
      [key]: item
    }
  }
}