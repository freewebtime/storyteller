import { IAstNodeModule, IAstNode, IAstNodeImport, IAstNodeVariable } from "../shared/IAstNode";
import { IAppContextModule, appContextFactory, IAppContextItem } from "../shared/IAppContext";
import { IHash } from "../shared/IHash";
import { AstNodeTypes } from "../shared/AstNodeTypes";

interface IReadResult {
  result: IAppContextItem,
  name: string,
  context: IHash<IAppContextItem>
}

export const appContextBuilder = {
  CreateModuleContext: (ast: IAstNodeModule, moduleName: string): IAppContextModule => {
    if (!ast) {
      return undefined;
    }

    // create moduleItems
    let moduleItems: IHash<IAppContextItem> = appContextBuilder.CreateModuleItems(ast);


    let moduleStart = ast.start;
    let moduleEnd = ast.end;

    let result = appContextFactory.createModule(moduleName, moduleItems, moduleStart, moduleEnd);
    return result;
  },

  CreateModuleItems: (astModule: IAstNodeModule): IHash<IAppContextItem> => {
    if (!astModule || !astModule.body || !astModule.body) {
      return undefined;
    }

    // go through all the subitems of the module
    // let subitems = astModule.program.body.map((subNode: IAstNode) => {
    //   let subitem = appContextBuilder.readAstNode(subNode);
    //   return subitem;
    // });

    let result = {}
    return result;
  },

  readModule: (astModule: IAstNodeModule, moduleName: string): IAppContextModule => {
    if (!astModule || !astModule.body || !astModule.body) {
      return undefined;
    }
    
    let items: IHash<IAppContextItem> = {};
    let appModule: IAppContextModule = appContextFactory.createModule(moduleName, items, astModule.start, astModule.end);

    let programBody = astModule.body;
    programBody.items.forEach((subAst: IAstNode) => {
      let appItem = appContextBuilder.readAstNode(subAst, items);
      if (appItem) {
      }
    });


    return appModule;
  },

  readAstNode: (ast: IAstNode, context: IHash<IAppContextItem>): IReadResult => {

    if (!ast) {
      return undefined;
    }

    let name: string;
    let result: IAppContextItem;

    switch (ast.type) {
      case AstNodeTypes.import: {
        // add variable to context
        return appContextBuilder.readAstImport(ast as IAstNodeImport, context);
      }

      case AstNodeTypes.variable: {
        // add variable to context
        return appContextBuilder.readAstVariable(ast as IAstNodeVariable, context);
      }
    
      default: {} break;
    }

    if (!result) {
      return undefined;
    }

    return {
      context: context,
      name: name,
      result: result,
    }
  },

  readAstImport: (ast: IAstNodeImport, context: IHash<IAppContextItem>): IReadResult => {
    if (!ast) {
      return undefined;
    }

    let name = ast.name.value || 'unnamed';
    let importPath: string;
    if (ast.path) {
      importPath = ast.path.value;
    }

    let result = appContextFactory.createImport(importPath, ast.start, ast.end);

    return {
      context: context,
      name: name,
      result: result
    }
  },

  readAstVariable: (ast: IAstNodeVariable, context: IHash<IAppContextItem>): IReadResult => {
    if (!ast) {
      return undefined;
    }

    let name = ast.name.value || 'unnamed';

    // it can be object or value

    // check subitems. if any, this is an object. otherwise - value
    if (ast.value) {

    }


    return undefined;
  },
}