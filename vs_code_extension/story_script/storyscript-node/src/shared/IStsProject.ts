import { IFileSystemItem } from "storyscript/shared/IFileSystemItem";
import { ICodeToken } from "storyscript/shared/ICodeToken";
import { IAstNodeModule } from "storyscript/shared/IAstNode";

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
  ast?: IAstNodeModule;
  jsContent?: string;
}
