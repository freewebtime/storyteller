import { IFileSystemItem } from "storyscript/out/shared/IFileSystemItem";
import { ICodeToken } from "storyscript/out/shared/ICodeToken";
import { IAstNode } from "storyscript/out/shared/IAstNode";
import { IExecTree } from "storyscript/out/shared/IExecTree";

export interface IStsProject {
  main: string;
  rootDir: IFileSystemItem;
  items: IStsProjectItem[];
}

export enum StsProjectItemType {
  folder = 'folder',
  module = 'module',
  other = 'other',
}

export interface IStsProjectItem {
  fsItem: IFileSystemItem;
  type: StsProjectItemType;

  subitems?: IStsProjectItem[];
  fileContent?: string;
  tokens?: ICodeToken[];
  ast?: IAstNode;
  jsContent?: string;
  execTree?: IExecTree;
}
