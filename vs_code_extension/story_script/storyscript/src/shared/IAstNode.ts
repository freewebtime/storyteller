import { ISymbolPosition } from "./ISymbolPosition";
import { AstNodeTypes } from "./AstNodeTypes";

export interface IAstNode {
  type: AstNodeTypes;
  start?: ISymbolPosition;
  end?: ISymbolPosition;
}

export interface IAstNodeModule extends IAstNode {
  name: string;
  body: IAstNodeArray;
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
