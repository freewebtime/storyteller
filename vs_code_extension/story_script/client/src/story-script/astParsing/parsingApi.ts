import { ISymbolPosition } from "../api/ISymbolPosition";

export enum AstNodeTypes {
  string = "string",
  number = "number",
  boolean = "boolean",
  identifier = "identifier",
  set = "set",
  binary = "binary",
  call = "call",
  if = "if",
  sequence = "sequence",
  import = "import",
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
}

export interface IAstNode {
  type: AstNodeTypes;
  start?: ISymbolPosition;
  end?: ISymbolPosition;
}

export interface IAstNodeImport extends IAstNode {
  alias: IAstNodeString;
  path: IAstNode[];
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

export interface IAstNodeIdentifier extends IAstNode {
  name: string;
}

export interface IAstNodeOperation extends IAstNode {
  operator: Operators;
  left?: IAstNode;
  right?: IAstNode;
}
export interface IAstNodeSet extends IAstNodeOperation {
}
export interface IAstNodeBinary extends IAstNodeOperation {
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
export interface IAstNodeSequence extends IAstNode {
  prog: IAstNode[];
}

export const astFactory = {
  
  createImport: (alias: IAstNodeString, path: IAstNode[], start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeImport => {
    return {
      type: AstNodeTypes.import,
      alias: alias,
      path: path,
      start: start,
      end: end,
    }
  },

  createSet: (left?: IAstNode, right?: IAstNode, start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeSet => {
    return {
      type: AstNodeTypes.set,
      operator: Operators.equals,
      left: left,
      right: right,
      start: start,
      end: end,
    }
  },
  createBinary: (operator: Operators, left?: IAstNode, right?: IAstNode, start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeBinary => {
    return {
      type: AstNodeTypes.binary,
      operator: operator,
      left: left,
      right: right,
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

  createSequence: (prog: IAstNode[], start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeSequence => {
    return {
      type: AstNodeTypes.sequence,
      prog: prog,
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
  createIdentifier: (name: string, start?: ISymbolPosition, end?: ISymbolPosition): IAstNodeIdentifier => {
    return {
      type: AstNodeTypes.identifier,
      name: name,
      start: start,
      end: end,
    }
  },

}
