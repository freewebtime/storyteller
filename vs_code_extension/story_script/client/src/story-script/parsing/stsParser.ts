import { ICodeToken } from "../api/ICodeToken";
import { IAstNode, IAstNodeText, IAstNodeTemplate, AstNodeType, IAstNodeMention, IAstNodeOperation, OperationType } from "../api/IAstNode";
import { CodeTokenType } from "../api/CodeTokenType";

interface IParserState {
  tokens: ICodeToken[];
  cursor: number;
  ast: IAstNode[];
}

interface IParseResult<TNode = IAstNode> {
  state: IParserState;
  astNode: TNode;
}

export const stsParser = {
  parse: (tokens: ICodeToken[]): IAstNode[] => {
    let state: IParserState = {
      tokens,
      cursor: 0,
      ast: []
    };

    while (!stsParser.isEndOfFile(state)) {
      let template = stsParser.parseTemplate(state);
      if (!template) {
        break;
      }

      state = stsParser.applyParseResult(template);
    }

    return state.ast;
  },

  parseTemplate: (state: IParserState): IParseResult => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    let astNode: IAstNodeTemplate = {
      type: AstNodeType.Template,
      value: []
    };

    let textBuffer: IAstNodeText;

    while (!stsParser.isEndOfFile(state)) {
      //can be mention or text

      //mention
      let mention = stsParser.parseMention(state);
      if (mention) {

        // check if we have something collected in a text buffer
        // and if so, add text buffer to the ast
        if (textBuffer) {
          astNode = {
            ...astNode,
            value: [
              ...astNode.value,
              textBuffer
            ]
          };

          textBuffer = undefined;
        }
        
        state = mention.state;

        // and finally add mention node to the result
        astNode = {
          ...astNode,
          value: [
            ...astNode.value,
            mention.astNode
          ]
        };

        continue;
      }

      // if we here, that means we haven't found any mention and next token will be read as text
      let nextToken = stsParser.getToken(state);
      if (!nextToken) {
        break;
      }

      // skip tokens 
      state = stsParser.skipTokens(state, 1);

      // add token value to the text buffer
      textBuffer = textBuffer || {
        type: AstNodeType.Text,
        value: '',
      };

      textBuffer = {
        ...textBuffer,
        value: `${textBuffer.value}${nextToken.value || ''}`
      };
    }

    if (textBuffer) {
      astNode = {
        ...astNode,
        value: [
          ...astNode.value,
          textBuffer
        ]
      };

      textBuffer = undefined;
    }

    if (astNode.value.length > 0) {
      return {
        state,
        astNode
      }
    }

    return undefined;
  },

  parseMention: (state: IParserState): IParseResult => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    // check if we start with *
    let starToken = stsParser.getToken(state);
    if (!starToken || starToken.type !== CodeTokenType.Star) {
      return undefined;
    }
    state = stsParser.skipTokens(state, 1);

    // mention content is an operation
    let operation = stsParser.parseOperation(state);
    if (!operation) {
      return undefined;
    }
    state = operation.state;

    // if found * and operation is going after that means we have correct mention
    let astNode: IAstNodeMention = {
      type: AstNodeType.Mention,
      value: operation.astNode
    };

    return {
      astNode,
      state,
    }
  },

  parseOperation: (state: IParserState): IParseResult<IAstNodeOperation> => {
    let operands: IAstNode[];
    let operators: OperationType[];

    let astNode: IAstNodeOperation = {
      type: AstNodeType.Operation,
      value: {
        leftOperand: undefined,
        operationType: undefined,
        rightOperand: undefined
      }
    }

    // 1. read operand? operator operand (operator operand)*
    let operand = stsParser.parseOperand(state);
    if (operand) {
      state = operand.state,
      astNode = {
        ...astNode,
        value: {
          ...astNode.value,
          leftOperand: operand.astNode
        }
      };

      return {
        astNode,
        state
      }
    }

    return undefined;
  },

  parseOperand: (state: IParserState): IParseResult => {
    let nextToken = stsParser.getToken(state);
    if (!nextToken || nextToken.type !== CodeTokenType.Word) {
      return undefined;
    }

    state = stsParser.skipTokens(state, 1);

    let astNode: IAstNodeText = {
      type: AstNodeType.Text,
      value: nextToken.value || ''
    };

    return {
      astNode,
      state
    }
  },

  parseScope: (state: IParserState): IParseResult => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    let starToken = stsParser.getToken(state);
    if (!starToken || starToken.type !== CodeTokenType.Star) {
      return undefined;
    }

    state = stsParser.skipTokens(state, 1);

    let astNode: IAstNode = {
      type: AstNodeType.Mention,
      value: starToken.value || ''
    };

    return {
      state,
      astNode
    }
  },

  parseLiteral: (state: IParserState): IParseResult => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    // check if we start with quote
    let startQuot = stsParser.getToken(state);
    if (!startQuot || startQuot.type !== CodeTokenType.Quote) {
      return undefined;
    }
    state = stsParser.skipTokens(state, 1);

    // if we here, that means we're inside the literal

    let astNode: IAstNodeTemplate = {
      type: AstNodeType.Template,
      value: []
    };

    let textBuffer: IAstNodeText;

    while (!stsParser.isEndOfFile(state)) {
      //can be mention or text

      //mention
      let mention = stsParser.parseMention(state);
      if (mention) {
        state = mention.state;

        // check if we have something collected in a text buffer
        // and if so, add text buffer to the ast
        if (textBuffer) {
          astNode = {
            ...astNode,
            value: [
              ...astNode.value,
              textBuffer
            ]
          };

          textBuffer = undefined;
        }

        // and finally add mention node to the result
        astNode = {
          ...astNode,
          value: [
            ...astNode.value,
            mention.astNode
          ]
        };

        continue;
      }

      // if we here, that means we haven't found any mention and next token will be read as text
      // but only in case when next token is not a closing quote
      let nextToken = stsParser.getToken(state);
      if (!nextToken || nextToken.type === CodeTokenType.Quote) {
        break;
      }

      // skip tokens 
      state = stsParser.skipTokens(state, 1);

      // add token value to the text buffer
      textBuffer = textBuffer || {
        type: AstNodeType.Text,
        value: '',
      };

      textBuffer = {
        ...textBuffer,
        value: `${textBuffer.value}${nextToken.value || ''}`
      };
    }

    // let's check are we have something in a text buffer that hasn't been added to ast node
    if (textBuffer) {
      astNode = {
        ...astNode,
        value: [
          ...astNode.value,
          textBuffer
        ]
      };

      textBuffer = undefined;
    }

    //and now we should find the closing quote
    let endQuote = stsParser.getToken(state);
    if (endQuote.type !== CodeTokenType.Quote) {
      // TODO: parsing error! we should add error info
    } else {
      state = stsParser.skipTokens(state, 1);
    }

    return {
      astNode,
      state
    }
  },

  getToken: (state: IParserState, cursorDelta: number = 0): ICodeToken => {
    const tokenIndex = cursorDelta + state.cursor;

    if (tokenIndex < 0 || stsParser.isEndOfFile(state, tokenIndex)) {
      return undefined;
    }

    return state.tokens[tokenIndex];
  },

  skipWhitespace: (state: IParserState): IParserState => {
    if (stsParser.isEndOfFile(state)) {
      return state;
    }

    let nextToken: ICodeToken;
    while (nextToken = stsParser.getToken(state)) {
      if (
        nextToken.type === CodeTokenType.Whitespace
        || nextToken.type === CodeTokenType.Space
        || nextToken.type === CodeTokenType.Endline
      ) {
        state = stsParser.skipTokens(state, 1);
        continue;
      }

      break;
    }

    return state;
  },

  skipTokens: (state: IParserState, skipCount: number): IParserState => {
    state = {
      ...state,
      cursor: state.cursor + skipCount
    };

    return state;
  },

  addAstNode: (state: IParserState, astNode: IAstNode): IParserState => {
    if (!state || !astNode) {
      return state;
    }

    state = {
      ...state,
      ast: [...state.ast, astNode]
    };

    return state;
  },

  applyParseResult: (parseResult: IParseResult): IParserState => {
    let state = parseResult.state;

    if (!state || !parseResult) {
      return state;
    }

    state = stsParser.addAstNode(state, parseResult.astNode);

    return state;
  },

  isEndOfFile: (state: IParserState, cursor: number | undefined = undefined): boolean => {
    if (cursor === undefined) {
      cursor = state.cursor;
    }
    return state.tokens.length <= cursor;
  }
}