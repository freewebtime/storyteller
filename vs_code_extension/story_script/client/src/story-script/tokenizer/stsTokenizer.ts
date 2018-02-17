import { ISymbolPosition } from "../api/ISymbolPosition";
import { ICodeToken } from "../api/ICodeToken";
import { stsParserConfig, ITokenConfig } from "./stsTokenizerConfig";
import { CodeTokenType } from "../api/CodeTokenType";
import { IAstNode, IAstNodeBlock, AstNodeType, IAstNodePrimitive, IAstNodeCall, IAstNodeOperation, IAstNodeVariable, IAstNodeReference } from "../api/IAstNode";

export interface ITokenizerState {
	sourceCode: string;
	cursor: ISymbolPosition;
	globalCursor: number;
	tokens: ICodeToken[];
}

export interface IParseResult<TAstNode = IAstNode> {
  state: ITokenizerState;
  astNode: TAstNode;
}

export const stsParser = {
  parseCode: (sourceCode: string): IAstNode => {
    let tokenizerState: ITokenizerState = {
      sourceCode: sourceCode,
      cursor: {
        line: 0,
        symbol: 0
      },
      globalCursor: 0,
      tokens: [],
    };

    let result: IAstNodeBlock = {
      type: AstNodeType.Block,
      value: []
    }

    let parseResult: IParseResult;
    while (parseResult = stsParser.parseTemplate(tokenizerState)) {
      if (!parseResult.astNode) {
        continue;
      }
      
      result = {
        ...result,
        value: [
          ...result.value,
          parseResult.astNode,
        ]
      }
    }

    let nextToken: ICodeToken;
    while (nextToken = stsParser.getNextToken(tokenizerState, CodeTokenType.Word)) {
      tokenizerState = stsParser.addToken(tokenizerState, nextToken);
    }

    return result;
  },

  parseTemplate: (state: ITokenizerState): IParseResult => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }
    
    let astNode: IAstNodeBlock = {
      type: AstNodeType.Block,
      value: [],
    };

    let textBuffer: IAstNodePrimitive;
    while (!stsParser.isEndOfFile(state)) {
      // here can be mention 
      let mention = stsParser.parseMention(state);
      if (mention) {
        state = mention.state;

        // check do we have something in buffer?
        if (textBuffer) {
          astNode = {
            ...astNode,
            value: [
              ...astNode.value,
              textBuffer,
            ],
          };

          textBuffer = undefined;
        }

        astNode = {
          ...astNode,
          value: [
            ...astNode.value,
            mention.astNode,
          ]
        };
      
        continue;
      }

      // or text
      let nextToken = stsParser.getNextToken(state, CodeTokenType.Word);
      if (!nextToken) {
        break;
      }

      state = stsParser.addToken(state, nextToken);

      textBuffer = textBuffer || {
        type: AstNodeType.Primitive,
        value: ''
      };

      textBuffer = {
        ...textBuffer,
        value: textBuffer.value + nextToken.value || ''
      };
    }

    // check do we have something in buffer?
    if (textBuffer) {
      astNode = {
        ...astNode,
        value: [
          ...astNode.value,
          textBuffer,
        ],
      };
    }

    return {
      state,
      astNode
    }
  },

  parseMention: (state: ITokenizerState): IParseResult => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    let starToken = stsParser.getNextToken(state, CodeTokenType.Word);
    if (!starToken) {
      return undefined;
    }

    if (starToken.type !== CodeTokenType.Star) {
      return undefined;
    }

    state = stsParser.addToken(state, starToken);

    let astNode: IAstNode;

    let parenBlock = stsParser.parseParenBlock(state);
    if (parenBlock) {
      state = parenBlock.state;
      astNode = parenBlock.astNode;
    }

    if (!astNode) {
      let expressionItem = stsParser.parseReference(state);
      if (expressionItem) {
        state = expressionItem.state;
        astNode = expressionItem.astNode;
      }
    }

    if (!astNode) {
      return undefined;
    }

    let semicolonToken = stsParser.getNextToken(state, CodeTokenType.Word);
    if (semicolonToken) {
      state = stsParser.addToken(state, semicolonToken);
    }

    return {
      astNode,
      state,
    }
  },

  parseReference: (state: ITokenizerState): IParseResult<IAstNodeReference> => {
    let astNode: IAstNodeReference = {
      type: AstNodeType.Reference,
      value: [],
    };

    let refPartResult: IParseResult;
    while (refPartResult = stsParser.parseReferenceItem(state)) {
      astNode = {
        ...astNode,
        value: [...astNode.value, refPartResult.astNode]
      };
      state = refPartResult.state;

      let dotToken = stsParser.getNextToken(state, CodeTokenType.Word);
      if (!dotToken || dotToken.type !== CodeTokenType.Dot) {
        break;
      }

      state = stsParser.addToken(state, dotToken);
    }

    return {
      astNode,
      state: state
    };
  },

  parseReferenceItem: (state: ITokenizerState): IParseResult => {
    let result: IParseResult = undefined;

    let literalResult = stsParser.parseLiteral(state);
    if (literalResult) {
      result = literalResult;
    }

    let wordResult = stsParser.parsePrimitive(state);
    if (wordResult) {
      result = wordResult;
    }

    if (result) {
      // check is it a function call
      state = result.state;
      let codeBlockResult = stsParser.parseParenBlock(state);
      if (codeBlockResult) {
        state = codeBlockResult.state;

        let astNode: IAstNodeCall = {
          type: AstNodeType.Call,
          target: result.astNode,
          arguments: codeBlockResult.astNode,
        };

        result = {
          state,
          astNode,
        }
      }
    }

    return result;
  },

  parseParenBlock: (state: ITokenizerState): IParseResult<IAstNodeBlock> => {
    let parenOpenToken = stsParser.getNextToken(state, CodeTokenType.Word);
    if (!parenOpenToken) {
      return undefined;
    }

    // read open paren
    if (parenOpenToken.type !== CodeTokenType.ParenOpen) {
      return undefined;
    }

    state = stsParser.addToken(state, parenOpenToken);
    state = stsParser.skipWhitespace(state) || state;

    let astNode: IAstNodeBlock = {
      type: AstNodeType.Block,
      value: []
    };

    // until reach closing paren...
    let nextToken: ICodeToken = stsParser.getNextToken(state, CodeTokenType.Word);
    while (nextToken) {
      if (nextToken.type === CodeTokenType.ParenClose) {
        state = stsParser.addToken(state, nextToken);
        break;
      }

      // ...read all operations
      state = stsParser.skipWhitespace(state) || state;
      let operation = stsParser.parseOperation(state);
      if (operation) {
        state = operation.state;
        astNode = {
          ...astNode,
          value: [
            ...astNode.value,
            operation.astNode,
          ]
        };
      } else {
        state = stsParser.addToken(state, nextToken);
      }

      nextToken = stsParser.getNextToken(state, CodeTokenType.Word);
    }    

    return {
      state, 
      astNode
    }
  },

  parseOperation: (state: ITokenizerState): IParseResult => {
    // operand operator operand ...operator operand
    state = stsParser.skipWhitespace(state) || state;
    
    let operations: IAstNode[] = [];

    // left operand
    let leftOperand = stsParser.parseOperand(state);
    if (leftOperand) {
      state = leftOperand.state;
      operations = [
        ...operations,
        leftOperand.astNode
      ];
    }

    state = stsParser.skipWhitespace(state) || state;

    // operator
    let operator: IParseResult;
    while (operator = stsParser.parseOperator(state)) {
      state = operator.state;
      operations = [
        ...operations,
        operator.astNode
      ];
      state = stsParser.skipWhitespace(state) || state;

      // right operand
      let rightOperand = stsParser.parseOperand(state);
      if (rightOperand) {
        operations = [
          ...operations,
          rightOperand.astNode
        ];

        state = rightOperand.state;
        state = stsParser.skipWhitespace(state) || state;
      }
    }

    //TODO: sort operations by priority

    let astNode: IAstNodeOperation = {
      type: AstNodeType.Operation,
      value: operations,
    }

    return {
      state,
      astNode
    }
  },

  parseOperator: (state: ITokenizerState): IParseResult => {
    let nextToken = stsParser.getNextToken(state, CodeTokenType.Word);
    if (!nextToken) {
      return undefined;
    }

    switch (nextToken.type) {

      case CodeTokenType.Plus:
      case CodeTokenType.Minus:
      case CodeTokenType.Star:
      case CodeTokenType.Slash:
      case CodeTokenType.Percent:
      case CodeTokenType.OrSign:
      case CodeTokenType.Ampersand:
        {
          const operatorNode: IAstNodePrimitive = {
            type: AstNodeType.Primitive,
            value: nextToken.value || ''
          };

          state = stsParser.addToken(state, nextToken);

          return { astNode: operatorNode, state };
        }

    }

    return undefined;
  },

  parseOperand: (state: ITokenizerState): IParseResult => {
    state = stsParser.skipWhitespace(state) || state;

    // operand can be 
    // code block
    let codeBlock = stsParser.parseParenBlock(state);
    if (codeBlock) {
      return codeBlock;
    }

    // reference 
    let refPath = stsParser.parseReference(state);
    if (refPath) {
      return refPath;
    }

    // literal
    let literal = stsParser.parseLiteral(state);
    if (literal) {
      return literal;
    }

    return undefined;
  },

  parseLiteral: (state: ITokenizerState): IParseResult => {
    state = stsParser.skipWhitespace(state) || state;
    let nextToken = stsParser.getNextToken(state, CodeTokenType.Word);
    if (!nextToken || nextToken.type !== CodeTokenType.Quote) {
      return undefined;
    }

    let targetNode: IAstNodePrimitive = {
      type: AstNodeType.Primitive,
      value: 'Output.Write',
    }

    let argumentsNode: IAstNodeBlock = {
      type: AstNodeType.Block,
      value: [],
    }

    let astNode: IAstNodeCall = {
      type: AstNodeType.Call,
      codeToken: nextToken,
      target: targetNode,
      arguments: argumentsNode,
    };

    state = stsParser.addToken(state, nextToken);

    while (nextToken = stsParser.getNextToken(state, CodeTokenType.Word)) {
      if (!nextToken) {
        break;
      }

      state = stsParser.addToken(state, nextToken);

      if (nextToken.type === CodeTokenType.Quote) {
        break;
      }

      const argNode: IAstNodePrimitive = {
        type: AstNodeType.Primitive,
        value: nextToken.value || '',
        codeToken: nextToken
      };

      argumentsNode = {
        ...argumentsNode,
        value: [
          ...argumentsNode.value,
          argNode
        ]
      };

      astNode = {
        ...astNode,
        arguments: argumentsNode
      }

    }

    return {
      astNode,
      state: state
    };
  },

  parsePrimitive: (state: ITokenizerState): IParseResult => {
    state = stsParser.skipWhitespace(state) || state;
    let nextToken = stsParser.getNextToken(state, CodeTokenType.Word);
    if (!nextToken || nextToken.type !== CodeTokenType.Word) {
      return undefined;
    }

    let astNode: IAstNodePrimitive = {
      type: AstNodeType.Primitive,
      value: nextToken.value || '',
    };
    state = stsParser.addToken(state, nextToken);

    return {
      astNode,
      state: state
    };
  },
  
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

		let nextToken: ICodeToken;
		while (nextToken = stsParser.getNextToken(state, CodeTokenType.Word)) {
			state = stsParser.addToken(state, nextToken);
		}

		return state;
	},

	getNextToken: (state: ITokenizerState, fallbackTokenType: CodeTokenType, pattern?: string): ICodeToken => {
    pattern = pattern || stsParserConfig.allSeparatorsPattern;
    pattern = stsParserConfig.wrapPatternWithCursorPos(pattern, state.globalCursor);
		const regexp = new RegExp(pattern);

		const match = regexp.exec(state.sourceCode);
		if (!match) {
			return undefined;
		}

		let tokenLength: number;
		let tokenValue: string;
		let tokenType: CodeTokenType;

		const searchIndex = match.index;
		if (searchIndex === 0) {
      tokenValue = match[0].substr(state.globalCursor);
			tokenType = stsParser.getTokenType(tokenValue);
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

	getTokenType: (tokenValue: string, tokensConfigs?: ITokenConfig[]): CodeTokenType => {
    tokensConfigs = tokensConfigs || stsParserConfig.tokens;
		for (let tokenIndex = 0; tokenIndex < tokensConfigs.length; tokenIndex++) {
			const tokenConfig = tokensConfigs[tokenIndex];
			const regexp = new RegExp(tokenConfig.pattern);
			const match = regexp.exec(tokenValue);
			if (match) {
				return tokenConfig.type;
			}
		}

		return undefined;
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
  
  skipWhitespace: (state: ITokenizerState): ITokenizerState => {
    const nextToken = stsParser.getNextToken(state, CodeTokenType.Word);
    if (!nextToken) {
      return undefined;
    }

    if (nextToken.type !== CodeTokenType.Whitespace  && nextToken.type !== CodeTokenType.Space) {
      return undefined;
    }

    state = stsParser.addToken(state, nextToken);
    return state;
  },

  isEndOfFile: (state: ITokenizerState): boolean => {
    return !state.sourceCode || state.globalCursor >= state.sourceCode.length;
  }
}