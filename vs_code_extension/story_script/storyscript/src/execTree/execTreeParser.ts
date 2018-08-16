import { IAstNodeModule, IAstNode, IAstNodeVariable, IAstNodeAddText, IAstNodeTemplate, IAstNodeString, IAstNodeArray, IAstNodeImport, IAstNodeMention, IAstNodeIdentifier } from "../shared/IAstNode";
import { IExecTree, IExecTreeArray, IExecTreeOperation, IExecTreeIdentifier, IExecTreeValueString } from "../shared/IExecTree";
import { AstNodeTypes } from "../shared/AstNodeTypes";
import { execTreeFactory } from "./execTreeFactory";
import { ISymbolPosition } from "../shared/ISymbolPosition";
import { OperationType } from "../shared/OperationType";

export const execTreeParser = {
  parseModule: (ast: IAstNodeModule): IExecTree => {
    if (!ast || !ast.body) {
      return undefined;
    }

    let start = ast.start;
    let end = ast.end;
    let operations: IExecTree[] = [];

    ast.body.items.forEach((itemNode: IAstNode) => {
      let itemOperations = execTreeParser.parseNode(itemNode, []);
      if (itemOperations) {
        operations = [
          ...operations,
          ...itemOperations
        ];
      }
    });

    // return array of operations
    let result = execTreeFactory.createArray(operations, start, end);
    return result;
  },

  parseNode: (ast: IAstNode, parent: string[]): IExecTree[] => {
    if (!ast) {
      return undefined;
    }

    switch (ast.type) {
      case AstNodeTypes.variable: {
        return execTreeParser.parseVariable(ast as IAstNodeVariable, parent);
      }

      case AstNodeTypes.addText: {
        return execTreeParser.parseAddText(ast as IAstNodeAddText, parent);
      }

      case AstNodeTypes.template: {
        let template = execTreeParser.parseTemplate(ast as IAstNodeTemplate, parent);
        return [template];
      }

      case AstNodeTypes.string: {
        let str = execTreeParser.parseString(ast as IAstNodeString);
        return [str];
      }

      case AstNodeTypes.array: {
        let array = execTreeParser.parseArray(ast as IAstNodeArray, parent);
        return array;
      }

      case AstNodeTypes.import: {
        let array = execTreeParser.parseImport(ast as IAstNodeImport, parent);
        return array;
      }
    }

    return undefined;
  },

  parseString: (astString: IAstNodeString): IExecTreeValueString => {
    if (!astString) {
      return undefined;
    }

    let result = execTreeFactory.createString(astString.value, astString.start, astString.end);
    return result;
  },

  parseIdentifier: (astIdentifier: IAstNodeIdentifier, parent: string[]): IExecTree => {
    if (!astIdentifier || !astIdentifier.name || !astIdentifier.name.items) {
      return undefined;
    }

    // identifier
    let result: IExecTreeIdentifier;
    let nameItemsAst = astIdentifier.name.items;

    let nameParts = nameItemsAst.map((nameItemAst: IAstNode) => {
      // name items can be string or (in future) operation
      switch (nameItemAst.type) {
        case AstNodeTypes.string: {
          let strNode = nameItemAst as IAstNodeString;
          if (strNode) {
            return strNode.value;
          }
        }
      }

      return undefined;
    });

    // skip all the undefined name parts
    nameParts = nameParts.filter((value) => {
      if (value) {
        return value;
      }

      return undefined;
    });

    nameParts = [
      ...parent,
      ...nameParts
    ];

    result = execTreeFactory.createIdentifier(nameParts, astIdentifier.start, astIdentifier.end);

    return result;
  },

  parseArray: (astArray: IAstNodeArray, parent: string[]): IExecTree[] => {
    if (!astArray || !astArray.items) {
      return undefined;
    }

    let result: IExecTree[] = [];
    astArray.items.map((subitem: IAstNode) => {
      let itemResult = execTreeParser.parseNode(subitem, parent);
      if (itemResult) {
        result = [
          ...result,
          ...itemResult
        ];
      }
    });

    return result;
  },

  parseImport: (ast: IAstNodeImport, parent: string[]): IExecTree[] => {
    if (!ast) {
      return undefined;
    }

    let result: IExecTree[] = [];

    // get full variable name
    let varName = ast.name.value;
    let fullName = [...parent, varName];

    // variable declaration
    result = execTreeParser.createVarDeclarations(fullName);

    // set value if any
    if (ast.path) {
      let importCallPath = execTreeFactory.createIdentifier(['require'], ast.path.start, ast.path.end);
      let importCallParams = [execTreeParser.parseString(ast.path)];

      let importCall = execTreeFactory.createCall(importCallPath, importCallParams, ast.path.start, ast.path.end);
      result = [
        ...result,
        importCall
      ];
    }

    return result;
  },

  parseMention: (astMention: IAstNodeMention, parent: string[]): IExecTree => {
    if (!astMention) {
      return undefined;
    }

    // mention is a get operation
    let leftOperand: IExecTree = undefined;
    let rightOperand: IExecTree;
    let targetAst = astMention.target;

    // mention target can be identifier or operation
    switch (targetAst.type) {
      case AstNodeTypes.identifier: {
        let identifier = execTreeParser.parseIdentifier(targetAst as IAstNodeIdentifier, []);
        rightOperand = identifier;
      } break;
    }

    let result = execTreeFactory.createOperation(leftOperand, rightOperand, OperationType.Get, astMention.start, astMention.end);
    return result;
  },

  parseVariable: (astVar: IAstNodeVariable, parent: string[]): IExecTree[] => {
    if (!astVar) {
      return undefined;
    }

    let result: IExecTree[] = [];

    // get full variable name
    let varName = astVar.name.value;
    let fullName = [...parent, varName];

    // variable declaration
    result = execTreeParser.createVarDeclarations(fullName);

    // set value if any
    if (astVar.value) {
      let varValueOperations = execTreeParser.parseNode(astVar.value, fullName);
      result = [
        ...result,
        ...varValueOperations
      ];
    }

    return result;
  },

  parseAddText: (astAddText: IAstNodeAddText, parent: string[]): IExecTree[] => {
    if (!astAddText) {
      return undefined;
    }

    let result: IExecTree[] = [];

    // get full variable name
    let fullName = [...parent];

    // variable declaration
    result = execTreeParser.createVarDeclarations(fullName);

    // set value
    if (astAddText.value) {
      let varValueOperations = execTreeParser.parseNode(astAddText.value, fullName);
      result = [
        ...result,
        ...varValueOperations
      ];
    }

    return result;
  },

  parseTemplate: (astTemplate: IAstNodeTemplate, parent: string[]): IExecTreeArray => {
    if (!astTemplate || !astTemplate.items) {
      return undefined;
    }

    let words = astTemplate.items.map((wordAst: IAstNode) => {
      // word can be string or mention
      switch (wordAst.type) {
        case AstNodeTypes.string: {
          let subitem = execTreeParser.parseString(wordAst as IAstNodeString);
          if (subitem) {
            return subitem;
          }
        }

        case AstNodeTypes.mention: {
          let subitem = execTreeParser.parseMention(wordAst as IAstNodeMention, []);
          if (subitem) {
            return subitem;
          }
        }
      }

      return undefined;
    }).filter((value) => {
      if (value) 
        return value; 
      
      return undefined;
    });

    // return result
    let result = execTreeFactory.createArray(words, astTemplate.start, astTemplate.end);
    return result;
  },

  createVarDeclarations: (fullName: string[], start?: ISymbolPosition, end?: ISymbolPosition): IExecTree[] => {
    if (!fullName) {
      return undefined;
    }

    let result: IExecTree[] = [];

    // declare all variable parts
    for (let i = 0; i < fullName.length; i++) {
      const fullSubname = fullName.slice(0, i + 1);
      // create variable declaration call
      let declareCallTarget = execTreeFactory.createIdentifier(execTreeParser.varDeclarationPath, start, end);
      let declareCallParam = fullSubname.map((dcSubname: string) => {
        return execTreeFactory.createString(dcSubname);
      });

      let declareParams = execTreeFactory.createArray(declareCallParam, start, end);
      let declareCall = execTreeFactory.createCall(declareCallTarget, [declareParams], start, end);
      result = [
        ...result,
        declareCall
      ];
    }

    return result;
  },

  contextPath: ['context'],
  varDeclarationPath: ['__environment', 'declare'],
  setValuePath: ['__environment', 'setValue'],
}