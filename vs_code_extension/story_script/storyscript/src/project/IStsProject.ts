import { IFileSystemItem } from "../shared/IFileSystemItem";
import { ICodeToken } from "../shared/ICodeToken";
import { IAstNode } from "../shared/IAstNode";

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
}
