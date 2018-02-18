import { ICodeToken } from "../api/ICodeToken";
import { IAstNode, IAstNodeText, IAstNodeTemplate, AstNodeType, IAstNodeMention, IAstNodeOperation, OperationType, IAstNodeOperator, IAstNodeScope } from "../api/IAstNode";
import { CodeTokenType } from "../api/CodeTokenType";
import { stsConfig } from "./stsConfig";

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
    let items: (IAstNode)[] = [];

    // read operand? operator operand (operator operand)*
    
    // 1. read left operand
    let leftOperand = stsParser.parseOperand(state);
    if (leftOperand) {
      state = leftOperand.state,
      items = [...items, leftOperand.astNode];
    }

    // 2. read operator
    let operator = stsParser.parseOperator(state);
    if (operator) {
      state = operator.state,
      items = [...items, operator.astNode];
    }

    // 3. read right operand
    let rightOperand = stsParser.parseOperand(state);
    if (rightOperand) {
      state = rightOperand.state,
      items = [...items, rightOperand.astNode];
    }

    let nextOperator: IParseResult;
    while (nextOperator = stsParser.parseOperator(state)) {
      state = nextOperator.state,
      items = [...items, nextOperator.astNode];

      // 3. read next operand
      let nextOperand = stsParser.parseOperand(state);
      if (nextOperand) {
        state = nextOperand.state,
        items = [...items, nextOperand.astNode];
      }
    }

    if (items.length > 0) {
      let roNode: IAstNodeScope = {
        type: AstNodeType.Scope,
        value: [...items.slice(2)]
      }

      let astNode: IAstNodeOperation = {
        type: AstNodeType.Operation,
        value: {
          leftOperand: leftOperand.astNode,
          operator: operator.astNode,
          rightOperand: roNode,
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
    // can be
    // parenBlock
    // literal
    
    // word
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

  parseOperator: (state: IParserState): IParseResult => {
    let nextToken = stsParser.getToken(state);
    if (!nextToken) {
      return undefined;
    }

    let astNode: IAstNodeOperator = {
      type: AstNodeType.Operator,
      value: undefined,
    };

    // can be

    // 1. get - means no spaces before and after
    if (nextToken.type === CodeTokenType.Dot) {
      state = stsParser.skipTokens(state, 1);
      let afterDot = stsParser.getToken(state);
      if (
        !afterDot 
        || afterDot.type !== CodeTokenType.Dot 
      ) {
        let operatorValue = nextToken.value || '';
        let operatorType = stsConfig.getOperationType(operatorValue);

        astNode = {
          ...astNode,
          value: {
            type: operatorType,
            value: operatorValue
          }
        };

        return { astNode, state }
      }
    }

    // any other operators can be after whitespace
    state = stsParser.skipWhitespace(state);
    nextToken = stsParser.getToken(state);

    if (!nextToken) {
      return undefined;
    }

    // 2. Copy (...)
    if (nextToken.type === CodeTokenType.Dot) {
      state = stsParser.skipTokens(state, 1);
      let dot2 = stsParser.getToken(state);
      if (dot2 && dot2.type === CodeTokenType.Dot) {
        state = stsParser.skipTokens(state, 1);
        let dot3 = stsParser.getToken(state);
        if (dot3 && dot3.type === CodeTokenType.Dot) {
          state = stsParser.skipTokens(state, 1);
          let operatorValue = `${nextToken.value}${dot2.value}${dot3.value}`;
          let operatorType = stsConfig.getOperationType(operatorValue);
          
          astNode = {
            ...astNode,
            value: {
              value: operatorValue,
              type: operatorType
            }
          };

          return { state, astNode }
        }
      }
    }

    return undefined;
  },

  parseScope: (state: IParserState): IParseResult => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    // open paren
    let openParen = stsParser.getToken(state);
    if (!openParen || openParen.type !== CodeTokenType.Star) {
      return undefined;
    }

    state = stsParser.skipTokens(state, 1);

    let astNode: IAstNode = {
      type: AstNodeType.Mention,
      value: openParen.value || ''
    };

    // collect content until close paren
    let nextToken: ICodeToken = stsParser.getToken(state);
    while (nextToken && nextToken.type !== CodeTokenType.ParenClose) {
      // content is an array of operations
      let operation = stsParser.parseOperation(state);
      if (!operation) {
        state = stsParser.skipTokens(state, 1);
      } else {
        state = operation.state;
        astNode = {
          ...astNode,
          value: [
            ...astNode.value,
            operation.astNode,
          ]
        };
      }
      
      nextToken = stsParser.getToken(state);
    }
    

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