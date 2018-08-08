import { IAstNode, AstNodeTypes, IAstNodeString, IAstNodeModule, IAstNodeImport, IAstNodeVariable, IAstNodeArray, IAstNodeProgram, IAstNodeTemplate, IAstNodeMention, IAstNodeAddText, IAstNodeIdentifier } from "../astParsing/parsingApi";
import { jsCompilerTemplates } from "./jsCompilerTemplates";

export const jsCompiler = {
  compile: (ast: IAstNode): string => {
    let result = jsCompiler.compileAstNode(ast, []);
    return result;
  },

  compileAstNode: (ast: IAstNode, parent: IAstNode[]): string => {
    if (!ast) {
      return undefined;
    }

    if (ast.type === AstNodeTypes.module) {
      let moduleNode = ast as IAstNodeModule;
      if (moduleNode) {
        return jsCompiler.compileModule(moduleNode);
      }
    }

    if (ast.type === AstNodeTypes.import) {
      let importNode = ast as IAstNodeImport;
      if (importNode) {
        return jsCompiler.compileImport(importNode, parent);
      }
    }
    
    if (ast.type === AstNodeTypes.variable) {
      let varNode = ast as IAstNodeVariable;
      if (varNode) {
        return jsCompiler.compileVariable(varNode, parent);
      }
    }

    if (ast.type === AstNodeTypes.mention) {
      let mentionNode = ast as IAstNodeMention;
      if (mentionNode) {
        return jsCompiler.compileMention(mentionNode, parent);
      }
    }

    if (ast.type === AstNodeTypes.string) {
      let strNode = ast as IAstNodeString;
      if (strNode) {
        return strNode.value;
      }
    }

    if (ast.type === AstNodeTypes.array) {
      let astArray = ast as IAstNodeArray;
      if (astArray) {

        let result = '';

        astArray.items.forEach((subitem: IAstNode) => {
          let itemResult = jsCompiler.compileAstNode(subitem, parent);
          if (itemResult) {
            result += itemResult + '\r';
          }
        });

        return result;
      }
    }

    if (ast.type === AstNodeTypes.addText) {
      let addTextNode = ast as IAstNodeAddText;
      if (addTextNode) {
        return jsCompiler.compileAddText(addTextNode, parent);
      }
    }

    if (ast.type === AstNodeTypes.identifier) {
      let identifierNode = ast as IAstNodeIdentifier;
      if (identifierNode) {
        let result = jsCompiler.createIdentifierFromAst(identifierNode.name.items, parent);
        return result;
      }
    }

    if (ast.type === AstNodeTypes.template) {
      let templAst = ast as IAstNodeTemplate;
      if (templAst) {

        let result = '`';

        templAst.items.forEach((subitem: IAstNode) => {
          let itemResult = jsCompiler.compileAstNode(subitem, parent);
          if (itemResult) {
            result += itemResult;
          }
        });

        return result + '`';
      }
    }

    if (ast.type === AstNodeTypes.program) {
      let astProgram = ast as IAstNodeProgram;
      if (astProgram) {

        let result = '';

        astProgram.body.forEach((subitem: IAstNode) => {
          let itemResult = jsCompiler.compileAstNode(subitem, parent);
          if (itemResult) {
            result += itemResult;
          }
        });

        return result;
      }
    }

    return ''; //ast.toString();
  },
  
  compileModule: (astNode: IAstNodeModule) : string => {
    const header = jsCompilerTemplates.moduleHeader;
    const body = jsCompiler.compileAstNode(astNode.program, []);

    return `${header}\r${body}`;
  },

  compileMention: (ast: IAstNodeMention, parent: IAstNode[]): string => {
    if (!ast) {
      return undefined;
    }

    let identifier = jsCompiler.compileAstNode(ast.target, parent);
    const result = jsCompilerTemplates.mentionTemplate(identifier);
    return result;
  },

  compileImport: (ast: IAstNodeImport, parent: IAstNode[]): string => {
    if (!ast) {
      return undefined;
    }

    let varName = ast.name.value;
    let contextName = jsCompiler.createIdentifierFromAst(parent, parent);
    let importPath = ast.path.value;
    let result = jsCompilerTemplates.importTemplate(contextName, varName, importPath);
    result += '\r';

    return result;
  },

  compileVariable: (ast: IAstNodeVariable, parent: IAstNode[]): string => {
    if (!ast) {
      return undefined;
    }

    let varName = ast.name.value;
    let contextName = jsCompiler.createIdentifierFromAst(parent, parent);
    let result = jsCompilerTemplates.variableTemplate(contextName, varName) + '\r';

    let subparent = [...parent, ast.name];
    let subitems = jsCompiler.compileAstNode(ast.value, subparent);

    if (subitems) {
      result = `${result}${subitems}`;
    }

    return result;
  },

  compileAddText: (ast: IAstNodeAddText, parent: IAstNode[]): string => {
    if (!ast) {
      return undefined;
    }

    let textValue = jsCompiler.compileAstNode(ast.value, parent);
    let contextName = jsCompiler.createIdentifierFromAst(parent, parent);
    let result = jsCompilerTemplates.addTextTemplate(contextName, textValue) + '\r';

    return result;
  },

  createIdentifierFromAst: (nameParts: IAstNode[], parent: IAstNode[]): string => {
    if (!nameParts || nameParts.length <= 0) {
      return 'context';
    }

    let compiledParts = nameParts.map((namePart: IAstNode) => {
      return jsCompiler.compileAstNode(namePart, parent);
    });

    let result = jsCompiler.createIdentifier(compiledParts);
    return result;
  },

  createIdentifier: (nameParts: string[]): string => {
    if (!nameParts || nameParts.length <= 0) {
      return 'context';
    }

    let result = 'context["' + nameParts.join('"]["') + '"]';

    return result;
  },

}
