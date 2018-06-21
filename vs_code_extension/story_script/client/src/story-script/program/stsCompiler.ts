import { IAstNodeModule, AstNodeType, IAstNode, IAstNodeItemDeclaration, IAstNodeTemplate } from "../api/IAstNode";
import { IHash } from "../../shared/IHash";
import { IProgram, IIdentifier, IModule, ProgramItemType, IOperation, ClassTypes, IClassFunction, IClass, IOperand } from "./programApi";

export const stsCompiler = {
  compileSts: (modulesAst: IAstNodeModule[]): IHash<IModule> => {
    let modules: IHash<IModule> = {};

    modulesAst.forEach(moduleAst => {
      let curModule = stsCompiler.compileModule(moduleAst);
      modules[curModule.name] = curModule; 
    });

    return modules;
  },

  compileModule: (moduleAst: IAstNodeModule): IModule => {
    let filePath = moduleAst.modulePath;
    let moduleName = moduleAst.moduleName;
    let fullName = filePath;

    let moduleConstructor: IClassFunction;
    let moduleItems: IHash<IIdentifier> = {};

    moduleAst.value.forEach(moduleItemAst => {
      let itemDeclaration = stsCompiler.compileItemDeclaration(moduleItemAst);

      let itemName: string = itemDeclaration.name;
      if (itemDeclaration) {
        moduleItems = {
          ...moduleItems,
          [itemName]: itemDeclaration,
        }

        return;
      }
    });

    let result: IModule = {
      construct: moduleConstructor,
      filePath,
      fullName,
      name: moduleName,
      items: moduleItems,
      type: ClassTypes.object,
    }

    return result;
  },

  compileItemDeclaration: (moduleItemAst: IAstNode): IIdentifier => {
    if (moduleItemAst.type !== AstNodeType.ItemDeclaration) {
      return undefined;
    }

    let astNode: IAstNodeItemDeclaration = moduleItemAst;
    let itemName = stsCompiler.parseStringConstant(astNode.value.itemName);
    let whitespace = astNode.value.whitespace || [];

    let sWhitespace = '';
    whitespace.forEach((wi: IAstNode) => {
      let text: string = wi.value;
      if (text) {
        sWhitespace = sWhitespace + text;
      }
    });

    let itemType: IClass;
    let itemValue: IOperand;

    let moduleItem: IIdentifier = {
      name: itemName,
      type: itemType,
      value: itemValue,
    }

    return moduleItem;
  },

  parseStringConstant: (sourceNode: IAstNode): string => {
    switch (sourceNode.type) {
      case AstNodeType.Text: {
        // text node
        return sourceNode.value;
      }
      
      case AstNodeType.Template: {
        // template. can be constant or with parameters (operation)
        return stsCompiler.parseConstantTemplate(sourceNode);    
      }

      default: { return undefined; }
    }
  },

  parseConstantTemplate: (sourceNode: IAstNode): string => {
    if (sourceNode.type !== AstNodeType.Template) {
      return undefined;
    }

    let templateNode: IAstNodeTemplate = sourceNode;
    let result: string = '';

    templateNode.value.forEach((itemNode: IAstNode) => {
      let itemText = stsCompiler.parseStringConstant(itemNode);
      if (!itemText) {
        // this is not a constant value
        return undefined;
      }

      result = result + itemText;
    });

    return result;
  },

  extractNodeValue: <T = any>(sourceNode: IAstNode): T => {
    let text = sourceNode.value as T;
    return text;
  } 
}

