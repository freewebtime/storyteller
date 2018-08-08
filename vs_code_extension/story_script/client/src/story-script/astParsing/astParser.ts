import { ICodeToken } from "../api/ICodeToken";
import { IAstNode, IAstNodeString, astFactory, IAstNodeIdentifier, Operators, IAstNodeArray, IAstNodeImport, IParsingError, IAstNodeModule, IAstNodeMention, IAstNodeTemplate, IAstNodeProgram, IAstNodeAddText } from "./parsingApi";
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
    let checkIndent = astParser.checkIndent(state, targetIndent);
    if (!checkIndent) {
      return undefined;
    }
    state = checkIndent.state;

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
    let varValue: IAstNodeProgram;

    // skip endline
    if (astParser.getTokenOfType(state, [CodeTokenType.Endline])) {
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
        varValue = astFactory.createProgram(varValueLines, varValueStart, end);
      }
    }

    let result = astFactory.createVariable(name, varType, varValue, targetIndent, start, end);
    
    return {
      state,
      result,
    }
  },

  parseAddText: (state: IParserState, targetIndent: number): IParseResult<IAstNodeAddText> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    // check indent
    let checkIndent = astParser.checkIndent(state, targetIndent);
    if (!checkIndent) {
      return undefined;
    }
    state = checkIndent.state;

    let start: ISymbolPosition = astParser.getCursorPosition(state);
    let end: ISymbolPosition = { ...start };

    let template: IAstNodeTemplate;
    let templateResult = astParser.parseTemplate(state);
    if (templateResult) {
      template = templateResult.result;
      state = templateResult.state;
      end = astParser.getCursorPosition(state);

      let result = astFactory.createAddText(template, targetIndent, start, end);

      return {
        result,
        state
      }
    }

    if (astParser.getTokenOfType(state, [CodeTokenType.Endline])) {
      end = {...start, symbol: start.symbol + 1};
      let templateString = astFactory.createString('\\n', start, end);
      let template = astFactory.createTemplate([templateString], start, end);
      let result = astFactory.createAddText(template, targetIndent, start, end);
      state = astParser.skipTokens(state, 1);

      return {
        result,
        state
      }
    }

    return undefined;
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

    const addTextResult = astParser.parseAddText(state, targetIndent);
    if (addTextResult) {
      return addTextResult;
    }

    return undefined;
  },

  parseTemplate: (state: IParserState): IParseResult<IAstNodeTemplate> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    let items: IAstNode[];
    let start = astParser.getCursorPosition(state);
    let end = { ...start };
    let itemResult: IParseResult<IAstNode>;
    while (itemResult = astParser.parseTemplateItem(state)) {
      state = itemResult.state;
      let item = itemResult.result;
      items = astParser.addItemToArray(items || [], item);
      end = item.end || end;

      if (astParser.getTokenOfType(state, [CodeTokenType.Endline])) {
        break;
      }
    }

    if (!items) {
      return undefined;
    }

    const result = astFactory.createTemplate(items, start, end);

    return {
      state,
      result
    }
  },

  parseTemplateItem: (state: IParserState): IParseResult<IAstNode> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    const mentionResult = astParser.parseMention(state);
    if (mentionResult) {
      return mentionResult;
    }

    const textResult = astParser.parseTemplateText(state);
    if (textResult) {
      return textResult;
    }

    return undefined;
  },

  parseTemplateText: (state: IParserState): IParseResult<IAstNodeString> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    // read everything until star or endline
    let textResult = astParser.readString(state, [CodeTokenType.Star, CodeTokenType.Endline]);
    if (textResult) {
      return textResult;
    }

    return undefined;
  },

  parseMention: (state: IParserState): IParseResult<IAstNodeMention> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    // check star symbol
    let starToken = astParser.getTokenOfType(state, [CodeTokenType.Star]);
    if (!starToken) {
      return undefined;
    }
    state = astParser.skipTokens(state, 1);

    let start = starToken.start;
    let result: IAstNodeMention;

    // parse identifier
    let identifierResult = astParser.parseIdentifier(state);
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

  parseIdentifier: (state: IParserState): IParseResult<IAstNodeIdentifier> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    let items: IAstNode[];
    let start = astParser.getCursorPosition(state);
    let end = {...start};
    let itemResult: IParseResult<IAstNode>;
    while (itemResult = astParser.parseIdentifierItem(state)) {
      state = itemResult.state;

      let item = itemResult.result;
      items = astParser.addItemToArray(items || [], item);
      end = item.end || end;

      if (!astParser.getTokenOfType(state, [CodeTokenType.Dot])) {
        break;
      }

      state = astParser.skipTokens(state, 1);
    }

    if (!items) {
      return undefined;
    }

    const name = astFactory.createArray(items, start, end);
    const result = astFactory.createIdentifier(name, name.start, name.end);
    
    return {
      state,
      result
    }
  },

  parseIdentifierItem: (state: IParserState): IParseResult<IAstNode> => {
    var wordResult = astParser.parseWord(state);
    if (wordResult) {
      return wordResult;
    }

    return undefined;
  },

  parseWord: (state: IParserState): IParseResult<IAstNodeString> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }

    let token = astParser.getTokenOfType(state, [CodeTokenType.Word]);
    if (!token) {
      return undefined;
    }
    
    let result = astFactory.createString(token.value, token.start, token.end);
    state = astParser.skipTokens(state, 1);

    return {
      state,
      result
    }
  },

  parseTextLine: (state: IParserState, targetIndent: number): IParseResult<IAstNodeString> => {
    if (astParser.isEndOfFile(state)) {
      return undefined;
    }
    
    let checkIndent = astParser.checkIndent(state, targetIndent);
    if (!checkIndent) {
      return undefined;
    }
    state = checkIndent.state;


    let lineResult = astParser.readString(state, [CodeTokenType.Endline]);
    return lineResult;
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