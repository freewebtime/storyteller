import { IStsProject, IStsProjectItem, StsProjectItemType } from "./IStsProject";
import { IFileSystemItem } from "../shared/IFileSystemItem";
import { IAstNode } from "../shared/IAstNode";
import { ICodeToken } from "../shared/ICodeToken";

export const stsProjectFactory = {
  createProject: (main: string, rootDir: IFileSystemItem, items: IStsProjectItem[]): IStsProject => {
    return {
      main: main,
      rootDir: rootDir,
      items: items,
    }
  },

  createProjectItem: (fsItem: IFileSystemItem, type: StsProjectItemType, fileContent?: string, ast?: IAstNode, subitems?: IStsProjectItem[], tokens?: ICodeToken[]): IStsProjectItem => {
    return {
      fsItem: fsItem,
      type: type,
      fileContent: fileContent,
      ast: ast,
      subitems: subitems,
      tokens: tokens
    }
  },

  createProjectModule: (fsItem: IFileSystemItem, fileContent?: string, ast?: IAstNode, tokens?: ICodeToken[]): IStsProjectItem => {
    return stsProjectFactory.createProjectItem(
      fsItem,
      StsProjectItemType.module,
      fileContent,
      ast,
      undefined,
      tokens
    );
  },

  createProjectItemFolder: (fsItem: IFileSystemItem, subitems?: IStsProjectItem[]): IStsProjectItem => {
    return stsProjectFactory.createProjectItem(
      fsItem,
      StsProjectItemType.folder,
      undefined,
      undefined,
      subitems,
      undefined
    );
  },
}