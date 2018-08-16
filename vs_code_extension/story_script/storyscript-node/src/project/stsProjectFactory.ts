import { IStsProject, IStsProjectItem, StsProjectItemType } from "../shared/IStsProject";
import { IFileSystemItem } from "storyscript/shared/IFileSystemItem";
import { IAstNode } from "storyscript/shared/IAstNode";
import { ICodeToken } from "storyscript/shared/ICodeToken";

export const stsProjectFactory = {
  createProject: (main: string, rootDir: IFileSystemItem, items: IStsProjectItem[]): IStsProject => {
    return {
      main: main,
      rootDir: rootDir,
      items: items,
    }
  },

  createProjectItem: (fsItem: IFileSystemItem, type: StsProjectItemType, fileContent?: string, ast?: IAstNode, subitems?: IStsProjectItem[], tokens?: ICodeToken[], jsContent?: string): IStsProjectItem => {
    return {
      fsItem: fsItem,
      type: type,
      fileContent: fileContent,
      ast: ast,
      subitems: subitems,
      tokens: tokens,
      jsContent
    }
  },

  createProjectModule: (fsItem: IFileSystemItem, fileContent?: string, ast?: IAstNode, tokens?: ICodeToken[], jsContent?: string): IStsProjectItem => {
    return stsProjectFactory.createProjectItem(
      fsItem,
      StsProjectItemType.module,
      fileContent,
      ast,
      undefined,
      tokens,
      jsContent
    );
  },

  createProjectItemFolder: (fsItem: IFileSystemItem, subitems?: IStsProjectItem[]): IStsProjectItem => {
    return stsProjectFactory.createProjectItem(
      fsItem,
      StsProjectItemType.folder,
      undefined,
      undefined,
      subitems,
      undefined,
      undefined
    );
  },
}