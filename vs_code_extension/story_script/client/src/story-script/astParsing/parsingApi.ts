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
}

export interface IAstNodeImport extends IAstNode {
  alias: string;
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
  
  createImport: (alias: string, path: IAstNode[]): IAstNodeImport => {
    return {
      type: AstNodeTypes.import,
      alias: alias,
      path: path,
    }
  },

  createSet: (left?: IAstNode, right?: IAstNode): IAstNodeSet => {
    return {
      type: AstNodeTypes.set,
      operator: Operators.equals,
      left: left,
      right: right,
    }
  },
  createBinary: (operator: Operators, left?: IAstNode, right?: IAstNode): IAstNodeBinary => {
    return {
      type: AstNodeTypes.binary,
      operator: operator,
      left: left,
      right: right,
    }
  },
  createCall: (func: IAstNode, args: IAstNode[]): IAstNodeCall => {
    return {
      type: AstNodeTypes.call,
      func: func,
      args: args,
    }
  },

  createIf: (cond: IAstNode, then?: IAstNode, otherwise?: IAstNode): IAstNodeIf => {
    return {
      type: AstNodeTypes.if,
      cond: cond,
      otherwise: otherwise,
      then: then,
    }
  },

  createSequence: (prog: IAstNode[]): IAstNodeSequence => {
    return {
      type: AstNodeTypes.sequence,
      prog: prog,
    }
  },

  createString: (value: string): IAstNodeString => {
    return {
      type: AstNodeTypes.string,
      value: value
    }
  },
  createNumber: (value: number): IAstNodeNumber => {
    return {
      type: AstNodeTypes.number,
      value: value
    }
  },
  createBoolean: (value: boolean): IAstNodeBoolean => {
    return {
      type: AstNodeTypes.boolean,
      value: value
    }
  },
  createIdentifier: (name: string): IAstNodeIdentifier => {
    return {
      type: AstNodeTypes.identifier,
      name: name
    }
  },

}
