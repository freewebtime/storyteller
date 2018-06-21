import { IAstNodeModule, AstNodeType } from "../api/IAstNode";
import { IProgram, IModule, ProgramItemType, IOperation } from "./api";
import { IHash } from "../../shared/IHash";

export const stsCompiler = {
  compileSts: (modulesAst: IAstNodeModule[]): IProgram => {
    // modulesAst.forEach(moduleAst => {
    //   let filePath = moduleAst.modulePath;
    //   let moduleName = moduleAst.moduleName;
    //   let fullName = filePath;

    //   let fields: IHash<IField>;
    //   // let curentModule: IModule = {
    //   //   filePath,
    //   //   name: moduleName,
    //   //   fullName,
    //   //   type: ProgramItemType.Module,

    //   // };

    //   // modules[fullName] = curentModule;
    // });

    let operations: IOperation[];
    let program: IProgram = {
      operations
    }

    return program;
  },

}

