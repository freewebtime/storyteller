import { ICodeToken } from "../api/ICodeToken";
import { IAstNode, IAstNodeText, IAstNodeTemplate, AstNodeType, IAstNodeMention, IAstNodeOperation, OperationType, IAstNodeOperator, IAstNodeScope, IAstNodeModule, IAstNodeImportDeclaration, IAstNodeImportPath, IAstNodeImportAlias, IAstNodeCollection, IAstNodeItemDeclaration } from "../api/IAstNode";
import { CodeTokenType } from "../api/CodeTokenType";
import { stsConfig } from "./stsConfig";
import { stsTokenizer } from "./stsTokenizer";

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

  parseModule: (sourceCode: string, moduleName: string, modulePath: string): IAstNodeModule => {
    if (!sourceCode){
      return null;
    }
    
    let tokens = stsTokenizer.tokenizeCode(sourceCode);

    let state: IParserState = {
      tokens,
      cursor: 0,
      ast: []
    };

    let moduleChildren: IAstNode[] = [];

    while (!stsParser.isEndOfFile(state)) {
      let moduleContentResult = stsParser.parseModuleContent(state);
      if (moduleContentResult) {
        state = moduleContentResult.state;
        moduleChildren = [
          ...moduleChildren,
          ...moduleContentResult.result
        ];
        continue;
      }

      break;
    }

    let moduleNode: IAstNodeModule = {
      type: AstNodeType.Module,
      moduleName,
      modulePath,
      value: moduleChildren
    };

    return moduleNode;
  },

  parseItemDeclaration: (state: IParserState): IParseResult => {
    state = stsParser.skipWhitespaceSingleLine(state);

    // starts with * operator
    let starToken = stsParser.getToken(state);
    if (starToken.type != CodeTokenType.Star) {
      return null;
    }
    state = stsParser.skipTokens(state, 1);

    let spaceToken = stsParser.getToken(state);
    if (spaceToken.type != CodeTokenType.Space) {
      return null;
    }
    state = stsParser.skipTokens(state, 1);

    // then we have name token
    let itemNameResult = stsParser.parseTemplateOuter(state);
    state = itemNameResult.state;
    let itemName = itemNameResult.astNode;

    // then check item type
    // and check item value
    let itemValue: IAstNode;
    let itemType: IAstNode;

    state = stsParser.skipWhitespaceSingleLine(state);
    let nextToken = stsParser.getToken(state);

    if (nextToken && nextToken.type === CodeTokenType.Colon) {
      state = stsParser.skipTokens(state, 1);

      let itemTypeResult = stsParser.parseTemplateOuter(state);
      if (itemTypeResult) {
        itemType = itemTypeResult.astNode;
        state = itemTypeResult.state;
      }
    } else if (nextToken && nextToken.type === CodeTokenType.Equals) {
      state = stsParser.skipTokens(state, 1);

      let itemValueResult = stsParser.parseTemplateOuter(state);
      if (itemValueResult) {
        itemValue = itemValueResult.astNode;
        state = itemValueResult.state;
      }
    }

    // prepare result
    let astNode: IAstNodeItemDeclaration = {
      type: AstNodeType.ItemDeclaration,
      value: {
        itemName,
        itemValue,
        itemType
      }
    };

    return {
      astNode,
      state
    }
  },

  parseTemplateOuter: (state: IParserState): IParseResult => {
    // parse as template but ends with =, : and endline

    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    let astNode: IAstNodeTemplate = {
      type: AstNodeType.Template,
      value: []
    };

    let textBuffer: IAstNodeText;

    while (!stsParser.isEndOfFile(state)) {
      //can be mention or text and 
      let nextToken = stsParser.getToken(state);
      if (nextToken.type === CodeTokenType.Endline
        || nextToken.type === CodeTokenType.Colon 
        || nextToken.type === CodeTokenType.Equals 
      ) {
        break;
      }

      //mention
      let mention = stsParser.parseMentionOuter(state);
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

      // text
      // if we here, that means we haven't found any mention and next token will be read as text
      nextToken = stsParser.getToken(state);
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

  parseImportDeclaration: (state: IParserState): IParseResult => {
    state = stsParser.skipWhitespaceSingleLine(state);
    
    // starts with *+ operator
    let starToken = stsParser.getToken(state);
    if (starToken.type != CodeTokenType.Star)
    {
      return null;
    }
    state = stsParser.skipTokens(state, 1);
    
    let plusToken = stsParser.getToken(state);
    if (plusToken.type != CodeTokenType.Plus) {
      return null;
    }
    state = stsParser.skipTokens(state, 1);
    
    let spaceToken = stsParser.getToken(state);
    if (spaceToken.type != CodeTokenType.Space) {
      return null;
    }
    state = stsParser.skipTokens(state, 1);

    // then we have alias token
    let importAliasResult = stsParser.parseImportAlias(state);
    state = importAliasResult.state;
    let importAlias = importAliasResult.astNode;

    // then search for equals sign and import path that should follow after it
    let importPath: IAstNodeImportPath = null;
    state = stsParser.skipWhitespaceSingleLine(state);
    let nextToken = stsParser.getToken(state);
    if (nextToken && nextToken.type === CodeTokenType.Equals) {
      state = stsParser.skipTokens(state, 1);

      // and finally parse import path
      let importPathResult = stsParser.parseImportPath(state);
      if (importPathResult) {
        importPath = importPathResult.astNode;
        state = importPathResult.state;
      }
    }    

    // prepare result
    let astNode: IAstNodeImportDeclaration = {
      type: AstNodeType.ImportDeclaration,
      value: {
        importAlias: importAlias,
        importPath: importPath,
      }
    };

    return {
      astNode,
      state
    }
  },

  parseImportAlias: (state: IParserState): IParseResult => {
    // alias is a variable
    
    let aliasName = '';
    let nextToken;
    while (nextToken = stsParser.getToken(state)){
      // parse text until reach endline or = sign
      if (nextToken.type === CodeTokenType.Endline || nextToken.type === CodeTokenType.Equals){
        break;
      }

      aliasName += nextToken.value;
      state = stsParser.skipTokens(state, 1);
    }

    aliasName = aliasName.trim();
    let aliasNode: IAstNodeText = {
      type: AstNodeType.Text,
      value: aliasName
    }

    let astNode: IAstNodeImportAlias = {
      type: AstNodeType.ImportAlias,
      value: aliasNode
    }

    return {
      astNode,
      state
    }
  },

  parseImportPath: (state: IParserState): IParseResult => {
    state = stsParser.skipWhitespaceSingleLine(state);

    // import path consists of import path items
    let pathValue: IAstNode[] = [];
    let pathItemValue = '';
    // parse until end of the line
    while (!stsParser.isEndOfFile(state)) {
      let nextToken = stsParser.getToken(state);
      if (nextToken) {
        // check end of current path item
        if (nextToken.type === CodeTokenType.Slash || nextToken.type === CodeTokenType.Endline) {
          state = stsParser.skipTokens(state, 1);

          // we're completed reading path item
          if (pathItemValue && pathItemValue.length > 0) {
            let pathItem: IAstNodeText = {
              type: AstNodeType.ImportPathItem,
              value: pathItemValue
            };
            
            pathValue = [
              ...pathValue,
              pathItem
            ];
          }

          pathItemValue = '';
          
          // break if we're at the end of line
          if (nextToken.type === CodeTokenType.Endline) {
            break;
          }

          continue;
        }

        state = stsParser.skipTokens(state, 1);
        pathItemValue += nextToken.value;
      }
    }

    let astNode: IAstNodeImportPath = {
      type: AstNodeType.ImportPath,
      value: pathValue
    }

    return {
      astNode,
      state
    }
  },

  parseModuleContent: (state: IParserState): {state: IParserState, result: IAstNode[]} => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    let moduleContent: IAstNode[] = [];
    let textBuffer: IAstNodeText;

    while (!stsParser.isEndOfFile(state)) {
      //can be import declaration, item declaration, mention or text

      // module declaration
      let importDeclaration = stsParser.parseImportDeclaration(state);
      if (importDeclaration) {
        // check if we have something collected in a text buffer
        // and if so, add text buffer to the ast
        if (textBuffer) {
          moduleContent = [
            ...moduleContent,
            textBuffer
          ];

          textBuffer = undefined;
        }

        state = importDeclaration.state;

        // add declaration to the result array
        moduleContent = [
          ...moduleContent,
          importDeclaration.astNode
        ];

        continue;
      }

      // item declaration
      let itemDeclaration = stsParser.parseItemDeclaration(state);
      if (itemDeclaration) {
        // check if we have something collected in a text buffer
        // and if so, add text buffer to the ast
        if (textBuffer) {
          moduleContent = [
            ...moduleContent,
            textBuffer
          ];

          textBuffer = undefined;
        }

        state = itemDeclaration.state;

        // add declaration to the result array
        moduleContent = [
          ...moduleContent,
          itemDeclaration.astNode
        ];

        continue;
      }

      //mention
      let mention = stsParser.parseMention(state);
      if (mention) {

        // check if we have something collected in a text buffer
        // and if so, add text buffer to the ast
        if (textBuffer) {
          moduleContent = [
            ...moduleContent,
            textBuffer
          ];

          textBuffer = undefined;
        }

        state = mention.state;

        // and finally add mention node to the result
        moduleContent = [
          ...moduleContent,
          mention.astNode
        ];

        continue;
      }

      // if we here, that means we haven't found any mention and next token will be read as text
      let nextToken = stsParser.getToken(state);
      if (!nextToken) {
        break;
      }

      // skip tokens 
      state = stsParser.skipTokens(state, 1);

      // end line tokens should be added separately
      if (nextToken.type === CodeTokenType.Endline) {

        if (textBuffer) {
          moduleContent = [
            ...moduleContent,
            textBuffer
          ];

          textBuffer = undefined;
        }

        let endlineToken: IAstNodeText = {
          type: AstNodeType.Text,
          value: nextToken.value
        };

        moduleContent = [
          ...moduleContent,
          endlineToken
        ];

        continue;
      }

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
      moduleContent = [
        ...moduleContent,
        textBuffer
      ];

      textBuffer = undefined;
    }

    if (moduleContent.length > 0) {
      return {
        state,
        result: moduleContent
      }
    }

    return undefined;
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

      // end line tokens should be added separately
      if (nextToken.type === CodeTokenType.Endline) {

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

        let endlineToken: IAstNodeText = {
          type: AstNodeType.Text,
          value: nextToken.value
        };

        astNode = {
          ...astNode,
          value: [
            ...astNode.value,
            endlineToken
          ]
        };

        continue;
      }
      
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

  parseMentionOuter: (state: IParserState): IParseResult => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    // check if we start with *
    let starToken = stsParser.getToken(state);
    if (!starToken || starToken.type !== CodeTokenType.Star) {
      return undefined;
    }
    state = stsParser.skipTokens(state, 1);

    // mention ends with space, semicolon
    // mention can be word, scope, template

    // mention content is an operation
    let operation = stsParser.parseMentionOperationOuter(state);
    if (!operation) {
      return undefined;
    }
    state = operation.state;

    //check if mention ends with semicolon
    let semicolon = stsParser.getToken(state);
    if (semicolon && semicolon.type === CodeTokenType.Semicolon) {
      state = stsParser.skipTokens(state, 1);
    }

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
    let operation = stsParser.parseMentionOperation(state);
    if (!operation) {
      return undefined;
    }
    state = operation.state;

    //check if mention ends with semicolon
    let semicolon = stsParser.getToken(state);
    if (semicolon && semicolon.type === CodeTokenType.Semicolon) {
      state = stsParser.skipTokens(state, 1);
    }

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

  parseOperationOuter: (state: IParserState): IParseResult => {
    let items: (IAstNode)[] = [];

    // read operand? operator operand (operator operand)*

    // 1. read left operand
    let leftOperand = stsParser.parseOperandOuter(state);
    if (leftOperand) {
      state = leftOperand.state,
      items = [...items, leftOperand.astNode];
    }

    let nextToken = stsParser.getToken(state);
    if (nextToken.type != CodeTokenType.Endline) {
      // 2. read operator
      let operator = stsParser.parseOperatorOuter(state);
      if (operator) {
        state = operator.state;
        items = [...items, operator.astNode];

        nextToken = stsParser.getToken(state);
        if (nextToken.type != CodeTokenType.Endline) {
          // 3. read right operand
          let rightOperand = stsParser.parseOperandOuter(state);
          if (rightOperand) {
            state = rightOperand.state,
              items = [...items, rightOperand.astNode];

            // 4. read all the next operator
            let nextOperator: IParseResult;
           
            while (nextOperator = stsParser.parseOperatorOuter(state)) {

              nextToken = stsParser.getToken(state);
              if (nextToken.type == CodeTokenType.Endline) {
                break;
              }
              
              state = nextOperator.state,
              items = [...items, nextOperator.astNode];

              // 5. read next operand
              let nextOperand = stsParser.parseOperandOuter(state);
              if (nextOperand) {
                state = nextOperand.state,
                items = [...items, nextOperand.astNode];
              } else {
                // if we don't have next operand that means this is the end of the operation
                break;
              }
            }

          }
        }
      }
    }

    if (items.length > 0) {
      let astNode = {
        type: AstNodeType.Operation,
        value: items
      };

      return {
        astNode,
        state
      }
    }

    return undefined;
  },
  
  parseMentionOperationOuter: (state: IParserState): IParseResult => {
    let items: (IAstNode)[] = [];

    // read operand? operator operand (operator operand)*

    // 1. read left operand
    let leftOperand = stsParser.parseOperandOuter(state);
    if (leftOperand) {
      state = leftOperand.state,
        items = [...items, leftOperand.astNode];
    }

    // 2. read operator
    let operator = stsParser.parseMentionOperator(state);
    if (operator) {
      state = operator.state;
      items = [...items, operator.astNode];

      // 3. read right operand
      let rightOperand = stsParser.parseOperandOuter(state);
      if (rightOperand) {
        state = rightOperand.state,
          items = [...items, rightOperand.astNode];

        // 4. read next operator
        let nextOperator: IParseResult;
        while (nextOperator = stsParser.parseMentionOperator(state)) {
          state = nextOperator.state,
            items = [...items, nextOperator.astNode];

          // 5. read next operand
          let nextOperand = stsParser.parseOperandOuter(state);
          if (nextOperand) {
            state = nextOperand.state,
              items = [...items, nextOperand.astNode];
          } else {
            // if we don't have next operand that means this is the end of the operation
            break;
          }
        }
      }
    }

    if (items.length > 0) {
      let astNode = {
        type: AstNodeType.Operation,
        value: items
      };

      return {
        astNode,
        state
      }
    }

    return undefined;
  },

  parseMentionOperation: (state: IParserState): IParseResult => {
    let items: (IAstNode)[] = [];

    // read operand? operator operand (operator operand)*

    // 1. read left operand
    let leftOperand = stsParser.parseOperand(state);
    if (leftOperand) {
      state = leftOperand.state,
        items = [...items, leftOperand.astNode];
    }

    // 2. read operator
    let operator = stsParser.parseMentionOperator(state);
    if (operator) {
      state = operator.state;
      items = [...items, operator.astNode];

      // 3. read right operand
      let rightOperand = stsParser.parseOperand(state);
      if (rightOperand) {
        state = rightOperand.state,
          items = [...items, rightOperand.astNode];

        // 4. read next operator
        let nextOperator: IParseResult;
        while (nextOperator = stsParser.parseMentionOperator(state)) {
          state = nextOperator.state,
            items = [...items, nextOperator.astNode];

          // 5. read next operand
          let nextOperand = stsParser.parseOperand(state);
          if (nextOperand) {
            state = nextOperand.state,
              items = [...items, nextOperand.astNode];
          } else {
            // if we don't have next operand that means this is the end of the operation
            break;
          }
        }
      }
    }

    if (items.length > 0) {
      let astNode = {
        type: AstNodeType.Operation,
        value: items
      };

      return {
        astNode,
        state
      }
    }

    return undefined;
  },

  parseOperation: (state: IParserState): IParseResult => {
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
      state = operator.state;
      items = [...items, operator.astNode];

      // 3. read right operand
      let rightOperand = stsParser.parseOperand(state);
      if (rightOperand) {
        state = rightOperand.state,
        items = [...items, rightOperand.astNode];

        // 4. read next operator
        let nextOperator: IParseResult;
        while (nextOperator = stsParser.parseOperator(state)) {
          state = nextOperator.state,
          items = [...items, nextOperator.astNode];

          // 5. read next operand
          let nextOperand = stsParser.parseOperand(state);
          if (nextOperand) {
            state = nextOperand.state,
            items = [...items, nextOperand.astNode];
          } else {
            // if we don't have next operand that means this is the end of the operation
            break;
          }
        }
      }
    }

    if (items.length > 0) {
      let astNode = {
        type: AstNodeType.Operation,
        value: items
      };

      return {
        astNode,
        state
      }
    }

    return undefined;
  },

  parseOperandOuter: (state: IParserState): IParseResult => {
    // can be
    // scope
    let scope = stsParser.parseScopeSingleLine(state);
    if (scope) {
      return scope;
    }

    // literal
    let literal = stsParser.parseLiteralSingleLine(state);
    if (literal) {
      return literal;
    }

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

  parseOperand: (state: IParserState): IParseResult => {
    // can be
    // scope
    let scope = stsParser.parseScope(state);
    if (scope) {
      return scope;
    }

    // literal
    let literal = stsParser.parseLiteral(state);
    if (literal) {
      return literal;
    }

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

  parseMentionOperator: (state: IParserState): IParseResult => {
    let getOperator = stsParser.parseGetOperator(state);
    if (getOperator) {
      return getOperator;
    }

    let callOperator = stsParser.parseCallOperator(state);
    if (callOperator) {
      return callOperator;
    }

    return undefined;
  },

  parseOperatorOuter: (state: IParserState): IParseResult => {
    let getOperator = stsParser.parseGetOperator(state);
    if (getOperator) {
      return getOperator;
    }

    let callOperator = stsParser.parseCallOperator(state);
    if (callOperator) {
      return callOperator;
    }

    state = stsParser.skipWhitespaceSingleLine(state);

    let copyOperator = stsParser.parseCopyOperator(state);
    if (copyOperator) {
      return copyOperator;
    }

    let oneTokenOperator = stsParser.parseOneTokenOperator(state);
    if (oneTokenOperator) {
      return oneTokenOperator;
    }

    return undefined;
  },
  parseOperator: (state: IParserState): IParseResult => {
    let getOperator = stsParser.parseGetOperator(state);
    if (getOperator) {
      return getOperator;
    }

    let callOperator = stsParser.parseCallOperator(state);
    if (callOperator) {
      return callOperator;
    }

    state = stsParser.skipWhitespace(state);

    let copyOperator = stsParser.parseCopyOperator(state);
    if (copyOperator) {
      return copyOperator;
    }

    let oneTokenOperator = stsParser.parseOneTokenOperator(state);
    if (oneTokenOperator) {
      return oneTokenOperator;
    }

    return undefined;
  },

  parseCallOperator: (state: IParserState): IParseResult => {
    // 1. Call. scope without spaces
    let scope = stsParser.parseScope(state);
    if (!scope) {
      return undefined;
    }

    let astNode: IAstNodeOperator = {
      type: AstNodeType.Operator,
      value: {
        type: OperationType.Call,
        value: '<Call>'
      },
    };

    return {
      astNode,
      state
    }
  },

  parseGetOperator: (state: IParserState): IParseResult => {
    // 1. Get. dot and no spaces before and after
    let nextToken = stsParser.getToken(state);
    if (!nextToken || nextToken.type !== CodeTokenType.Dot) {
      return undefined;
    }

    let astNode: IAstNodeOperator = {
      type: AstNodeType.Operator,
      value: undefined,
    };

    state = stsParser.skipTokens(state, 1);
    let afterDot = stsParser.getToken(state);
    if (!afterDot || afterDot.type !== CodeTokenType.Dot) {
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

    return undefined;
  },

  parseCopyOperator: (state: IParserState): IParseResult => {
    // Copy (...)
    let nextToken = stsParser.getToken(state);
    if (!nextToken || nextToken.type !== CodeTokenType.Dot) {
      return undefined;
    }

    let astNode: IAstNodeOperator = {
      type: AstNodeType.Operator,
      value: undefined,
    };

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

        state = stsParser.skipWhitespace(state);

        return { state, astNode }
      }

    }

    return undefined;
  },

  parseOneTokenOperator: (state: IParserState): IParseResult => {
    let nextToken = stsParser.getToken(state);
    if (!nextToken) {
      return undefined;
    }

    state = stsParser.skipTokens(state, 1);
    let operatorValue = `${nextToken.value}`;
    let operatorType = stsConfig.getOperationType(operatorValue);

    if (
      operatorType 
      && (
        operatorType === OperationType.Sum
        || operatorType === OperationType.Diff
        || operatorType === OperationType.Multiply
        || operatorType === OperationType.Divide
        || operatorType === OperationType.More
        || operatorType === OperationType.Less
        || operatorType === OperationType.Power
        || operatorType === OperationType.Set
        || operatorType === OperationType.Signature
      )
    ) {
      let astNode: IAstNodeOperator = {
        type: AstNodeType.Operator,
        value: {
          value: operatorValue,
          type: operatorType
        }
      };

      state = stsParser.skipWhitespace(state);

      return {
        state,
        astNode
      }
    }

    return undefined;
  },

  parseScopeSingleLine: (state: IParserState): IParseResult => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    // open paren
    let openParen = stsParser.getToken(state);
    if (!openParen || openParen.type !== CodeTokenType.ParenOpen) {
      return undefined;
    }

    state = stsParser.skipTokens(state, 1);

    let astNode: IAstNodeScope = {
      type: AstNodeType.Scope,
      value: []
    };

    // collect content until close paren
    let nextToken: ICodeToken = stsParser.getToken(state);
    while (nextToken && nextToken.type !== CodeTokenType.ParenClose && nextToken.type !== CodeTokenType.Endline) {
      // content is an array of operations
      let operation = stsParser.parseOperationOuter(state);
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

    //and now we should find the closing paren
    let closeParen = stsParser.getToken(state);
    if (closeParen.type !== CodeTokenType.ParenClose) {
      // TODO: parsing error! we should add error info
    } else {
      state = stsParser.skipTokens(state, 1);
    }

    return {
      state,
      astNode
    }
  },
  parseScope: (state: IParserState): IParseResult => {
    if (stsParser.isEndOfFile(state)) {
      return undefined;
    }

    // open paren
    let openParen = stsParser.getToken(state);
    if (!openParen || openParen.type !== CodeTokenType.ParenOpen) {
      return undefined;
    }

    state = stsParser.skipTokens(state, 1);

    let astNode: IAstNodeScope = {
      type: AstNodeType.Scope,
      value: []
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

    //and now we should find the closing paren
    let closeParen = stsParser.getToken(state);
    if (closeParen.type !== CodeTokenType.ParenClose) {
      // TODO: parsing error! we should add error info
    } else {
      state = stsParser.skipTokens(state, 1);
    }
    
    return {
      state,
      astNode
    }
  },
  
  parseLiteralSingleLine: (state: IParserState): IParseResult => {
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
      let mention = stsParser.parseMentionOuter(state);
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
      if (!nextToken || nextToken.type === CodeTokenType.Quote || nextToken.type === CodeTokenType.Endline) {
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

      // end line tokens should be added separately
      if (nextToken.type === CodeTokenType.Endline) {

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

        let endlineToken: IAstNodeText = {
          type: AstNodeType.Text,
          value: nextToken.value
        };

        astNode = {
          ...astNode,
          value: [
            ...astNode.value,
            endlineToken
          ]
        };

        continue;
      }

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

  skipWhitespaceSingleLine: (state: IParserState): IParserState => {
    if (stsParser.isEndOfFile(state)) {
      return state;
    }

    let nextToken: ICodeToken;
    while (nextToken = stsParser.getToken(state)) {
      if (
        nextToken.type === CodeTokenType.Whitespace
        || nextToken.type === CodeTokenType.Space
      ) {
        state = stsParser.skipTokens(state, 1);
        continue;
      }

      break;
    }

    return state;
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

  addChildNode: <TNode extends IAstNode>(parentNode: TNode, childNode: IAstNode): TNode => {
    var parent = parentNode as IAstNode;

    if (childNode) {
      parent = {
        ...parent,
        value: [
          ...parent.value,
          childNode
        ]
      }
    }

    return parent as TNode;
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