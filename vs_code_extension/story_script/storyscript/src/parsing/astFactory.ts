import { ISymbolPosition } from "../shared/ISymbolPosition";
import { IAstNodeMention, IAstNode, IAstNodeTemplate, IAstNodeAddText, IAstNodeString, IAstNodeArray, IAstNodeIdentifier, IAstNodeVariable, IAstNodeProgram, IAstNodeCall, IAstNodeImport, IAstNodeModule } from "../shared/IAstNode";
import { AstNodeTypes } from "../shared/AstNodeTypes";
import { IParsingError } from "../shared/IParsingError";

export const astFactory = {

  createParsingError: (position: ISymbolPosition, message: string): IParsingError => {
    return {
      message,
      position
    }
  },

  createModule: (program: IAstNodeProgram, name: string, start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeModule => {
    return {
      type: AstNodeTypes.module,
      name: name,
      program: program,
      start,
      end
    }
  },
  createCall: (params: IAstNode[], start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeCall => {
    return {
      type: AstNodeTypes.call,
      params: params,
      start,
      end
    }
  },

  createImport: (name: IAstNodeString, path: IAstNodeString, indent: number, start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeImport => {
    return {
      type: AstNodeTypes.import,
      name: name,
      path: path,
      indent: indent,
      start: start,
      end: end,
    }
  },

  createProgram: (body: IAstNode[], start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeProgram => {
    return {
      type: AstNodeTypes.program,
      body: body,
      start: start,
      end: end,
    }
  },

  createVariable: (name: IAstNodeString, varType: IAstNodeString, value: IAstNode, indent: number, start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeVariable => {
    return {
      type: AstNodeTypes.variable,
      name: name,
      value: value,
      varType: varType,
      indent: indent,
      start: start,
      end: end,
    }
  },

  createAddText: (value: IAstNodeTemplate, indent: number, start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeAddText => {
    return {
      type: AstNodeTypes.addText,
      value: value,
      indent: indent,
      start: start,
      end: end,
    }
  },

  createMention: (target: IAstNode, start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeMention => {
    return {
      type: AstNodeTypes.mention,
      target: target,
      start: start,
      end: end,
    }
  },

  createString: (value: string, start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeString => {
    return {
      type: AstNodeTypes.string,
      value: value,
      start: start,
      end: end,
    }
  },
  createArray: (items: IAstNode[], start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeArray => {
    return {
      type: AstNodeTypes.array,
      items,
      start,
      end
    }
  },
  createTemplate: (items: IAstNode[], start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeTemplate => {
    return {
      type: AstNodeTypes.template,
      items,
      start,
      end
    }
  },

  createIdentifier: (name: IAstNodeArray, start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeIdentifier => {
    return {
      type: AstNodeTypes.identifier,
      name: name,
      start: start,
      end: end,
    }
  },

}