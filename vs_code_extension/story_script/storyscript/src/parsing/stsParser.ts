import { ICodeToken } from "../shared/ICodeToken";
import { IAstNode, IAstNodeString, IAstNodeIdentifier, IAstNodeImport, IAstNodeModule, IAstNodeMention, IAstNodeTemplate, IAstNodeAddText, IAstNodeCall, IAstNodeArray } from "../shared/IAstNode";
import { CodeTokenType } from "../shared/CodeTokenType";
import { ISymbolPosition } from "../shared/ISymbolPosition";
import { IHash } from "../shared/IHash";
import { astFactory } from "./astFactory";
import { Operators } from "../shared/Operators";
import { IParsingError } from "../shared/IParsingError";

export interface IParserState {
  tokens: ICodeToken[];
  cursor: number;
}

export interface IParseError {
  message: string;
  position: ISymbolPosition;
}

export interface IParseResult<TResult = any> {
  state: IParserState;
  result: TResult;
  errors?: IParseError[];
}

export const stsParser = {

  parseModule: (tokens: ICodeToken[], moduleName: string): { result: IAstNodeModule, errors: IParsingError[] } => {
    let state: IParserState = 
    {
      tokens: tokens,
      cursor: 0,
    };

    let errors: IParsingError[] = [];
    let subitems: IAstNode[] = [];

    while (!stsParser.isEndOfFile(state)) {
      let subitemResult = stsParser.parseSubitem(state, 0);
      if (subitemResult) {
        state = subitemResult.state;
        let subitem = subitemResult.result;

        subitems = stsParser.addItemToArray(subitems, subitem);
        continue;
      }

      state = stsParser.skipTokens(state, 1);
    }

    let start: ISymbolPosition = { line: 0, symbol: 0 }
    let end: ISymbolPosition = { line: 0, symbol: 0 }

    if (subitems.length > 0) {
      end = subitems[subitems.length - 1].end;
    }

    const body = astFactory.createArray(subitems, start, end);
    const result = astFactory.createModule(body, moduleName, start, end);
    return {
      errors,
      result
    }
  },

  parseImport: (state: IParserState, targetIndent: number): IParseResult<IAstNodeImport> => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    // check whitespace
    let checkIndent = stsParser.checkIndent(state, targetIndent);
    if (!checkIndent) {
      return undefined;
    }
    state = checkIndent.state;

    // read import mark *+
    const markSequence = [CodeTokenType.Star, CodeTokenType.Plus, CodeTokenType.Space];
    if (!stsParser.checkTokenSequence(state, markSequence)) {
      return undefined;
    }

    let start: ISymbolPosition = stsParser.getCursorPosition(state);
    let end: ISymbolPosition = {
      ...start, 
      symbol: start.symbol + markSequence.length
    };

    state = stsParser.skipTokens(state, markSequence.length);

    // read import name until '=' sign or end of line
    let name: IAstNodeString;
    let nameResult = stsParser.readString(state, [CodeTokenType.Endline, CodeTokenType.Equals], true);
    if (nameResult) {
      state = nameResult.state;
      name = nameResult.result;

      end = name.end || end;
    }

    // if found '=' sign, then parse everything as path until end of line
    let path: IAstNodeString;
    let nextToken = stsParser.getToken(state);
    if (nextToken && nextToken.type === CodeTokenType.Equals) {
      state = stsParser.skipTokens(state, 1);

      // we've skipped = sign
      const pathResult = stsParser.readString(state, [CodeTokenType.Endline], true);
      if (pathResult) {
        path = pathResult.result;
        end = path.end || end;
      
        state = pathResult.state;
      }
    }

    // skip endline if any
    if (stsParser.getTokenOfType(state, [CodeTokenType.Endline])) {
      state = stsParser.skipTokens(state, 1);
    }
    if (stsParser.getTokenOfType(state, [CodeTokenType.Endline])) {
      state = stsParser.skipTokens(state, 1);
    }

    const result = astFactory.createImport(name, path, targetIndent, start, end);
    return {
      state, 
      result,
    }
  },

  parseVariable: (state: IParserState, targetIndent: number): IParseResult<IAstNode> => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    // check empty lines before variable. and if any, skip it
    while (stsParser.getTokenOfType(state, [CodeTokenType.Endline])) {
      state = stsParser.skipTokens(state, 1);
    }    

    // check indent
    let checkIndent = stsParser.checkIndent(state, targetIndent);
    if (!checkIndent) {
      return undefined;
    }
    state = checkIndent.state;

    // read item mark * 
    const markSequence = [CodeTokenType.Star, CodeTokenType.Space];
    if (!stsParser.checkTokenSequence(state, markSequence)) {
      return undefined;
    }

    let start: ISymbolPosition = stsParser.getCursorPosition(state);
    let end: ISymbolPosition = {...start, symbol: start.symbol + markSequence.length};

    state = stsParser.skipTokens(state, markSequence.length);

    // read item name name until : or end of line
    let name: IAstNodeString;
    let nameResult = stsParser.readString(state, [CodeTokenType.Endline, CodeTokenType.Colon], true);
    if (nameResult) {
      state = nameResult.state;
      name = nameResult.result;

      start = name.start || start;
      end = name.end || end;
    }

    // read var type
    let varType: IAstNodeString;

    // check if we stopped on colon
    if (stsParser.checkTokenSequence(state, [CodeTokenType.Colon])) {
      state = stsParser.skipTokens(state, 1);

      end = stsParser.getCursorPosition(state);

      // read type
      let varTypeResult = stsParser.readString(state, [CodeTokenType.Endline], true);
      if (varTypeResult) {
        varType = varTypeResult.result;
        state = varTypeResult.state;

        end = varType.end || end;
      }
    }

    // check variable value
    let varValue: IAstNodeArray;

    // skip endline
    if (stsParser.getTokenOfType(state, [CodeTokenType.Endline])) {
      state = stsParser.skipTokens(state, 1);

      // find all subitems
      let parseSubitemResult: IParseResult;
      let varValueLines: IAstNode[];
      let varValueStart: ISymbolPosition = stsParser.getCursorPosition(state);
      while (parseSubitemResult = stsParser.parseSubitem(state, targetIndent + 1)) {
        let subitem = parseSubitemResult.result;
        state = parseSubitemResult.state;

        end = subitem.end || end;

        varValueLines = varValueLines || [];
        varValueLines = stsParser.addItemToArray(varValueLines, subitem);

        if (stsParser.getTokenOfType(state, [CodeTokenType.Endline])) {
          state = stsParser.skipTokens(state, 1);
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

  parseAddText: (state: IParserState, targetIndent: number): IParseResult<IAstNodeAddText> => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    // check indent
    let checkIndent = stsParser.checkIndent(state, targetIndent);
    if (!checkIndent) {
      return undefined;
    }
    state = checkIndent.state;

    let start: ISymbolPosition = stsParser.getCursorPosition(state);
    let end: ISymbolPosition = { ...start };

    let template: IAstNodeTemplate;
    let templateResult = stsParser.parseTemplate(state);
    if (templateResult) {
      template = templateResult.result;
      state = templateResult.state;
      end = stsParser.getCursorPosition(state);

      let result = astFactory.createAddText(template, targetIndent, start, end);

      return {
        result,
        state
      }
    }

    if (stsParser.getTokenOfType(state, [CodeTokenType.Endline])) {
      end = {...start, symbol: start.symbol + 1};
      let templateString = astFactory.createString('\\n', start, end);
      let template = astFactory.createTemplate([templateString], start, end);
      let result = astFactory.createAddText(template, targetIndent, start, end);
      state = stsParser.skipTokens(state, 1);

      return {
        result,
        state
      }
    }

    return undefined;
  },

  parseSubitem: (state: IParserState, targetIndent: number): IParseResult<IAstNode> => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    const importResult = stsParser.parseImport(state, targetIndent);
    if (importResult) {
      return importResult;
    }

    const variableResult = stsParser.parseVariable(state, targetIndent);
    if (variableResult) {
      return variableResult;
    }

    const addTextResult = stsParser.parseAddText(state, targetIndent);
    if (addTextResult) {
      return addTextResult;
    }

    return undefined;
  },

  parseTemplate: (state: IParserState): IParseResult<IAstNodeTemplate> => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    let items: IAstNode[];
    let start = stsParser.getCursorPosition(state);
    let end = { ...start };
    let itemResult: IParseResult<IAstNode>;
    while (itemResult = stsParser.parseTemplateItem(state)) {
      state = itemResult.state;
      let item = itemResult.result;
      items = stsParser.addItemToArray(items || [], item);
      end = item.end || end;

      if (stsParser.getTokenOfType(state, [CodeTokenType.Endline])) {
        // // add endline item
        // let endlineStart = stsParser.getCursorPosition(state);
        // state = stsParser.skipTokens(state, 1);
        // let endlineEnd = stsParser.getCursorPosition(state);
        // end = endlineEnd;

        // let endlineItem = astFactory.createString('\n', endlineStart, endlineEnd);
        // items = stsParser.addItemToArray(items || [], endlineItem);
        
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
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    const mentionResult = stsParser.parseMention(state);
    if (mentionResult) {
      return mentionResult;
    }

    const textResult = stsParser.parseTemplateText(state);
    if (textResult) {
      return textResult;
    }

    return undefined;
  },

  parseTemplateText: (state: IParserState): IParseResult<IAstNodeString> => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    // read everything until star or endline
    let textResult = stsParser.readString(state, [CodeTokenType.Star, CodeTokenType.Endline]);
    if (textResult) {
      return textResult;
    }

    return undefined;
  },

  parseMention: (state: IParserState): IParseResult<IAstNodeMention> => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    // check star symbol
    let starToken = stsParser.getTokenOfType(state, [CodeTokenType.Star]);
    if (!starToken) {
      return undefined;
    }
    state = stsParser.skipTokens(state, 1);

    let start = starToken.start;
    let result: IAstNodeMention;

    // parse identifier
    let identifierResult = stsParser.parseIdentifier(state);
    if (identifierResult) {
      state = identifierResult.state;

      let identifier = identifierResult.result;
      let end = identifier.end;

      result = astFactory.createMention(identifier, start, end);

      if (stsParser.getTokenOfType(state, [CodeTokenType.Semicolon])) {
        state = stsParser.skipTokens(state, 1);
      }

      return {
        state,
        result
      }
    }

    return undefined;
  },

  parseIdentifier: (state: IParserState): IParseResult<IAstNodeIdentifier> => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    let items: IAstNode[];
    let start = stsParser.getCursorPosition(state);
    let end = {...start};
    let itemResult: IParseResult<IAstNode>;
    while (itemResult = stsParser.parseIdentifierItem(state)) {
      state = itemResult.state;

      let item = itemResult.result;
      items = stsParser.addItemToArray(items || [], item);
      end = item.end || end;

      if (!stsParser.getTokenOfType(state, [CodeTokenType.Dot, CodeTokenType.ParenOpen])) {
        break;
      }

      if (stsParser.getTokenOfType(state, [CodeTokenType.Dot])) {
        state = stsParser.skipTokens(state, 1);
      }
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
    var wordResult = stsParser.parseWord(state);
    if (wordResult) {
      return wordResult;
    }

    var stringResult = stsParser.parseQuotedString(state, false);
    if (stringResult) {
      return stringResult;
    }

    var callResult = stsParser.parseCall(state);
    if (callResult) {
      return callResult;
    }

    return undefined;
  },

  parseCall: (state: IParserState): IParseResult<IAstNodeCall> => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    // skip (
    if (!stsParser.getTokenOfType(state, [CodeTokenType.ParenOpen])) {
      return undefined;   
    }
    let start = stsParser.getCursorPosition(state);
    state = stsParser.skipTokens(state, 1);

    state = stsParser.skipWhitespace(state, true);

    // read everything as identifiers until )
    let params: IAstNode[] = [];
    while (!stsParser.getTokenOfType(state, [CodeTokenType.ParenClose])) {
      // check identifier
      let identifierResult = stsParser.parseIdentifier(state);
      if (identifierResult) {
        let identifier = identifierResult.result;
        state = identifierResult.state;
        state = stsParser.skipWhitespace(state, true);

        params = [
          ...params,
          identifier
        ];

        continue;
      }

      // if we here, skip symbol
      state = stsParser.skipTokens(state, 1);
    }

    if (stsParser.getTokenOfType(state, [CodeTokenType.ParenClose])) {
      state = stsParser.skipTokens(state, 1);
    }
    let end = stsParser.getCursorPosition(state);
    let result = astFactory.createCall(params, start, end);
    
    return {
      state, 
      result
    };
  },

  parseWord: (state: IParserState): IParseResult<IAstNodeString> => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    let token = stsParser.getTokenOfType(state, [CodeTokenType.Word]);
    if (!token) {
      return undefined;
    }

    let result = astFactory.createString(token.value, token.start, token.end);
    state = stsParser.skipTokens(state, 1);

    return {
      state,
      result
    }
  },

  parseQuotedString: (state: IParserState, multiline: boolean): IParseResult<IAstNodeString> => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    if (!stsParser.getTokenOfType(state, [CodeTokenType.Quote])) {
      return undefined;
    }

    state = stsParser.skipTokens(state, 1);

    // read as string until end of line or quote
    let breakTokens = [CodeTokenType.Quote];
    if (!multiline) {
      breakTokens = [
        ...breakTokens,
        CodeTokenType.Endline
      ];
    }
    
    let result: IAstNodeString;
    let textResult = stsParser.readString(state, breakTokens);
    if (textResult) {
      state = textResult.state;
      result = textResult.result;
    }

    // it's not a quoted string if there is no end quote
    if (!stsParser.getTokenOfType(state, [CodeTokenType.Quote])) {
      return undefined;
    }

    // skip end quote
    state = stsParser.skipTokens(state, 1);

    return {
      state,
      result
    }
  },

  parseTextLine: (state: IParserState, targetIndent: number): IParseResult<IAstNodeString> => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }
    
    let checkIndent = stsParser.checkIndent(state, targetIndent);
    if (!checkIndent) {
      return undefined;
    }
    state = checkIndent.state;


    let lineResult = stsParser.readString(state, [CodeTokenType.Endline]);
    return lineResult;
  },

  readString: (state: IParserState, breakTokens: CodeTokenType[], trimString: boolean = false): IParseResult<IAstNodeString> => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    let result: string;
    let startPos: ISymbolPosition;
    let endPos: ISymbolPosition;
    let nextToken: ICodeToken;
    let offset = 0;

    while (nextToken = stsParser.getToken(state, offset)) {
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

    state = stsParser.skipTokens(state, offset);

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
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    if (skipSpace) {
      state = stsParser.skipWhitespace(state, multiline);
    }

    // operation mark may be . + - / * > < =
    let token = stsParser.getToken(state);
    if (!token) {
      return undefined;
    }

    for (let key in Operators) {
      const operator = Operators[key];
      if (token.value === operator) {
        state = stsParser.skipTokens(state, 1);

        return {
          state,
          result: operator as Operators,
        }
      }
    }

    return undefined;
  },

  skipTokens: (state: IParserState, tokensCount: number): IParserState => {
    if (stsParser.isEndOfFile(state)) {
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
    return stsParser.readTokensAsString(state, [CodeTokenType.Space]);
  },

  readTokensAsString: (state: IParserState, tokenTypes: CodeTokenType[]): IParseResult<IAstNodeString> => {
    let start: ISymbolPosition;
    let end: ISymbolPosition;
    let value: string;    
    let nextToken: ICodeToken;

    while (nextToken = stsParser.getTokenOfType(state, tokenTypes)) {
      if (!value) {
        start = nextToken.start;
        end = nextToken.end;
        value = nextToken.value;
      } 
      else {
        end = nextToken.end;
        value = value + nextToken.value;
      }

      state = stsParser.skipTokens(state, 1);
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
    return stsParser.skipTokensOfType(state, tokenTypes);
  },
  skipTokenOfType: (state: IParserState, tokenTypes: CodeTokenType[]): IParserState => {
    let nextToken = stsParser.getTokenOfType(state, tokenTypes);
    if (nextToken) {
      state = stsParser.skipTokens(state, 1);
    }

    return state;
  },
  skipTokensOfType: (state: IParserState, tokenTypes: CodeTokenType[]): IParserState => {
    if (stsParser.isEndOfFile(state)) {
      return state;
    }

    if (!tokenTypes || tokenTypes.length <= 0) {
      return state;
    }

    let nextToken: ICodeToken;
    while (nextToken = stsParser.getToken(state)) {
      if (tokenTypes.indexOf(nextToken.type) < 0) {
        return state;
      }

      state = stsParser.skipTokens(state, 1);
    }

    return state;
  },
  skipUntil: (state: IParserState, tokenTypes: CodeTokenType[]): IParserState => {
    if (stsParser.isEndOfFile(state)) {
      return state;
    }

    if (!tokenTypes || tokenTypes.length <= 0) {
      return state;
    }

    let nextToken: ICodeToken;
    while (nextToken = stsParser.getToken(state)) {
      if (tokenTypes.indexOf(nextToken.type) >= 0) {
        return state;
      }

      state = stsParser.skipTokens(state, 1);
    }

    return state;
  },

  checkIndent: (state: IParserState, targetIndent: number): IParseResult<IAstNodeString> => {
    // check indent
    let whitespace: IAstNodeString;
    let indent = 0;
    const whitespaceResult = stsParser.readWhitespace(state);
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
    if (stsParser.isEndOfFile(state)) {
      return false;
    }

    if (!tokenTypes || tokenTypes.length <= 0) {
      return true;
    }

    for (let i = 0; i < tokenTypes.length; i++) {
      const tokenType = tokenTypes[i];
      const token = stsParser.getToken(state, i);
      if (!token || token.type !== tokenType) {
        // broken sequence
        return undefined;
      }
    }

    return true;
  },

  getToken: (state: IParserState, offset: number = 0): ICodeToken => {
    if (stsParser.isEndOfFile(state, offset)) {
      return undefined;
    }

    const cursor = state.cursor + offset;
    if (cursor < 0) {
      return undefined;
    }

    return state.tokens[cursor];
  },
  getTokenOfType: (state: IParserState, types: CodeTokenType[], offset: number = 0): ICodeToken => {
    if (stsParser.isEndOfFile(state, offset)) {
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

    if (stsParser.isEndOfFile(state)) {
      if (state.tokens.length > 0) {
        let lastToken = state.tokens[state.tokens.length - 1];
        return lastToken.start;
      }
    }

    const nextToken = stsParser.getToken(state);
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
    return stsParser.addItemToArray(errors, astFactory.createParsingError(position, message));
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