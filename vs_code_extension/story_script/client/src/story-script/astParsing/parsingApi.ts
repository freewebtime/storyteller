import { ISymbolPosition } from "../api/ISymbolPosition";
import { IHash } from "../../shared/IHash";

export enum AstNodeTypes {
  string = "string",
  number = "number",
  boolean = "boolean",
  array = "array",
  object = "object",
  identifier = "identifier",
  operation = 'operation',
  call = "call",
  if = "if",
  program = "program",
  import = "import",
  mention = "mention",
  variable = "variable",
  module = "module",
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

export interface IAstNodeObject extends IAstNode {
  fields: IHash<IAstNode>;
}


export interface IAstNodeMention extends IAstNode {
  target: IAstNode;
}


export interface IAstNodeString extends IAstNode {
  value: string;
}
export interface IAstNodeNumber extends IAstNode {
  value: number;
}
export interface IAstNodeBoolean extends IAstNode {
  value: boolean;
}
export interface IAstNodeArray extends IAstNode {
  items: IAstNode[];
}


export interface IAstNodeIdentifier extends IAstNode {
  name: IAstNode;
}

export interface IAstNodeOperation extends IAstNode {
  operator: Operators;
  left?: IAstNode;
  right?: IAstNode;
}

export interface IAstNodeCall extends IAstNode {
  func: IAstNode;
  args: IAstNode[];
}
export interface IAstNodeIf extends IAstNode {
  cond: IAstNode;
  then?: IAstNode;
  otherwise?: IAstNode;
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

  createOperation: (operator: Operators, left?: IAstNode, right?: IAstNode, start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeOperation => {
    return {
      type: AstNodeTypes.operation,
      operator: operator,
      left: left,
      right: right,
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

  createCall: (func: IAstNode, args: IAstNode[], start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeCall => {
    return {
      type: AstNodeTypes.call,
      func: func,
      args: args,
      start: start,
      end: end,
    }
  },

  createIf: (cond: IAstNode, then?: IAstNode, otherwise?: IAstNode, start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeIf => {
    return {
      type: AstNodeTypes.if,
      cond: cond,
      otherwise: otherwise,
      then: then,
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
  createNumber: (value: number, start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeNumber => {
    return {
      type: AstNodeTypes.number,
      value: value,
      start: start,
      end: end,
    }
  },
  createBoolean: (value: boolean, start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeBoolean => {
    return {
      type: AstNodeTypes.boolean,
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
  createObject: (fields: IHash<IAstNode>, start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeObject => {
    return {
      type: AstNodeTypes.array,
      fields,
      start,
      end
    }
  },
  createIdentifier: (name: IAstNode, start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeIdentifier => {
    return {
      type: AstNodeTypes.identifier,
      name: name,
      start: start,
      end: end,
    }
  },

}
