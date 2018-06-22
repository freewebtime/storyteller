import { ICodeToken } from "../api/ICodeToken";

export enum AstNodeType {
  Text = 'Text',
  CommentLine = 'Comment line',
  CommentBlock = 'Comment block',

  Program = 'Program',
  Module = 'Module',

  ImportDeclaration = 'Import declaration',
  ImportPath = 'Import path',
  ImportPathSeparator = 'Import path separator',
  ImportPathItem = 'Import path item',
  ImportAlias = 'Import alias',

  ItemDeclaration = 'Item declaration',
  ItemName = 'Item name',
  ItemValue = 'Item value',

  Endline = 'Endline',
  Whitespace = 'Whitespace',

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

  // : //var: signature
  Signature = 'Signature'
}

export interface IAstNode<TValue = any> {
  type: AstNodeType;
  codeToken?: ICodeToken;
  value: TValue;
}

export interface IAstNodeCollection<TNode extends IAstNode> extends IAstNode<TNode[]> {}

export interface IAstNodeModule extends IAstNode<IAstNode[]> {
  moduleName: string,
  modulePath: string
}
export interface IAstModuleContent extends IAstNode<IAstNode[]>{}

export interface IAstNodeImportDeclaration extends IAstNode<{
  importAlias: IAstNodeImportAlias,
  importPath: IAstNodeImportPath
}> {}
export interface IAstNodeImportPath extends IAstNode<IAstNode[]> { }
export interface IAstNodeImportAlias extends IAstNode<IAstNode> { }

export interface IAstNodeItemDeclaration extends IAstNode<{
  whitespace?: IAstNode[],
  itemName: IAstNode,
  itemType: IAstNode,
  itemValue: IAstNode,
}>{}

export interface IAstNodeText extends IAstNode<string> {}

export interface IAstNodeComment extends IAstNode<IAstNode[]> {}

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
export interface IAstNodeArray extends IAstNode{}

export interface IAstNodeScope extends IAstNode<IAstNodeOperation[]>{}
export interface IAstNodeOperation extends IAstNode<{
  operator: IAstNodeOperator;
  leftOperand: IAstNode;
  rightOperand: IAstNode;
}> {}
export interface IAstNodeOperator extends IAstNode<{
  value: string;
  type: OperationType;
}> {}
export interface IAstNodeCondition extends IAstNode<{
  condition: IAstNode;
  onSuccess: IAstNode;
  onFail: IAstNode; 
}>{}
