import { IHash } from "../IHash";

export enum ProjectItemType {
  Folder = 'Folder',
  File = 'File',
}

export interface IProjectItem {
  id: string;
  shortId: string;
  name: string;
  parentId?: string;
  subitems?: IHash<string>;
  projectItemType: ProjectItemType;
}

export interface IFolder extends IProjectItem {
}

export interface IFile extends IProjectItem {
  fileType: string;
}
