import { IHash } from "../IHash";

export enum ProjectItemType {
  Unknown = 'Unknown',

  Folder = 'Folder',
  File = 'File',
}

export interface IProjectItem {
  id: string;
  shortId: string;
  parentId?: string;
  name: string;
  projectItemType: ProjectItemType;
}

export interface IPiFolder extends IProjectItem {
  subitems: IHash<string>;
}

export interface IPiFile extends IProjectItem {
  extension: string;
}
