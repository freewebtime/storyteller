import { IHash } from "../../shared/IHash";

export enum FileSystemItemType {
  folder = 'folder',
  file = 'file',
}

export interface IFileSystemItem {
  type: FileSystemItemType;
  name: string;
  fullPath: string;

  subitems?: IHash<IFileSystemItem>;
}