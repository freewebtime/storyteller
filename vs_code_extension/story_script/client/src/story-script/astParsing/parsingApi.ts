import { ISymbolPosition } from "../api/ISymbolPosition";
import { IHash } from "../../shared/IHash";

export enum AstNodeTypes {
  string = "string",
  array = "array",
  identifier = "identifier",
  program = "program",
  import = "import",
  mention = "mention",
  variable = "variable",
  module = "module",
  template = "template",
  addText = 'addText',
  call = 'call',
}

export enum Operators {
  equals = '=',
  increment = '++',
  plus = '+',
  decrement = '--',
  minus = '-',
  multiply = '*',
  divide = '/',
  more = '>',
  less = '<',
  get = '.',
  add = 'add',
  remove = '*-',
}

export interface IAstNode {
  type: AstNodeTypes;
  start?: ISymbolPosition;
  end?: ISymbolPosition;
}

export interface IAstNodeModule extends IAstNode {
  name: string;
  program: IAstNodeProgram;
}

export interface IAstNodeProgram extends IAstNode {
  body: IAstNode[];
}

export interface IAstNodeImport extends IAstNode {
  indent: number;
  name: IAstNodeString;
  path: IAstNodeString;
}

export interface IAstNodeVariable extends IAstNode {
  name: IAstNodeString;
  indent: number;
  varType: IAstNodeString;
  value?: IAstNode;
}

export interface IAstNodeCall extends IAstNode {
  params: IAstNode[];
}

export interface IAstNodeAddText extends IAstNode {
  indent: number;
  value: IAstNodeTemplate;
}

export interface IAstNodeTemplate extends IAstNodeArray {
}

export interface IAstNodeMention extends IAstNode {
  target: IAstNode;
}
export interface IAstNodeString extends IAstNode {
  value: string;
}
export interface IAstNodeArray extends IAstNode {
  items: IAstNode[];
}
export interface IAstNodeIdentifier extends IAstNode {
  name: IAstNodeArray;
}

export interface IParsingError {
  position: ISymbolPosition;
  message: string;
}

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
      name:name,
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
