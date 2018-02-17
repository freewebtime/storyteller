import { ICodeToken } from "../api/ICodeToken";

export enum AstNodeType {
  Primitive = 'Primitive',
  Variable = 'Variable',
  Call = 'Call',
  Block = 'Block',
  Function = 'Function',
  Operation = 'Operation',
  Reference = 'Reference',
}

export interface IAstNode {
  type: AstNodeType;
  codeToken?: ICodeToken;
}

export interface IAstNodePrimitive extends IAstNode {
  value: string|boolean|number;
}

export interface IAstNodeReference extends IAstNode {
  value: IAstNode[];
}

export interface IAstNodeBlock extends IAstNode {
  value: IAstNode[];
}

export interface IAstNodeOperation extends IAstNode {
  value: IAstNode[];
}

export interface IAstNodeCall extends IAstNode {
  target: IAstNode;
  arguments: IAstNode;
}

export interface IAstNodeVariable extends IAstNode {
  name: IAstNode;
  variableType: IAstNodeReference;
  value: IAstNode;
}

export interface IAstNodeFunction extends IAstNode {
  params: IAstNodeBlock;
  operations: IAstNode;
}


