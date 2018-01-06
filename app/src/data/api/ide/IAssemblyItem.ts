import { IHash } from "../IHash";

export enum AssemlbyItemType {
  Project = 'Project',
  Folder = 'Folder',
  File = 'File',
}

export interface IAssemblyItem {
  id: string;
  shortId: string;
  name: string;
  parentId?: string;
  assemlbyItemType: AssemlbyItemType;
}

export interface IFolder extends IAssemblyItem {
  subitems: IHash<string>;
}

export interface IProject extends IFolder {

}

export interface IFile extends IAssemblyItem {
  fileType: string;
}
