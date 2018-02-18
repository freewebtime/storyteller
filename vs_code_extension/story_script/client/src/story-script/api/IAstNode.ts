import { ICodeToken } from "../api/ICodeToken";

export enum AstNodeType {
  Text = 'Text',

  Template = 'Template',
  Mention = 'Mention',

  Reference = 'Reference',
  Variable = 'Variable',

  Object = 'Object',
  Function = 'Function',
  Array = 'Array',

  Scope = 'Scope',
  Operation = 'Operation',
  Condition = 'Condition',
  Operator = 'Operator',
}

export enum OperationType {
  // +
  Sum = 'Sum',
  // - 
  Diff = 'Diff',
  // *
  Multiply = 'Multiply',
  // /
  Divide = 'Divide',
  // ...
  Copy = 'Copy',
  // *-
  Delete = 'Delete',
  // = 
  Set = 'Set',

  // ^x
  Power = 'Power',
  // \^
  Root = 'Root',

  // . // means item.subitem
  Get = 'Get',
  // function call
  Call = 'Call',
  // array index // means item[asd]
  Index = 'Index',

  // *=
  Return = 'Return',

  // ||
  Or = 'Or',
  // && 
  And = 'And',
  // >
  More = 'More',
  // < 
  Less = 'Less',
  // >=
  MoreOrEquals = 'MoreOrEquals',
  // <= 
  LessOrEquals = 'LessOrEquals',
}

export interface IAstNode<TValue = any> {
  type: AstNodeType;
  codeToken?: ICodeToken;
  value: TValue;
}

export interface IAstNodeText extends IAstNode<string> {}

export interface IAstNodeTemplate extends IAstNode<IAstNode[]>{}
export interface IAstNodeMention extends IAstNode<IAstNodeOperation>{}

export interface IAstNodeReference extends IAstNode<{
  target: IAstNode;
  subtarget: IAstNode;
  arguments: IAstNode[];
}> {}

export interface IAstNodeVariable extends IAstNode<{
  name: IAstNode;
  type: IAstNode;
}> {}

export interface IAstNodeObject extends IAstNode<IAstNodeVariable[]>{}
export interface IAstNodeFunction extends IAstNode<{
  parameters: IAstNodeObject;
  result: IAstNode;
}> {}
export interface IAstNodeArray extends IAstNode<IAstNode>{}

export interface IAstNodeScope extends IAstNode<IAstNodeOperation[]>{}
export interface IAstNodeOperation extends IAstNode<{
  operationType: OperationType;
  leftOperand: IAstNode;
  rightOperand: IAstNode;
}> {}
export interface IAstNodeCondition extends IAstNode<{
  condition: IAstNode;
  onSuccess: IAstNode;
  onFail: IAstNode; 
}>{}
