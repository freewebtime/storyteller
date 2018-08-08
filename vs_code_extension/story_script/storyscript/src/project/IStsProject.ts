import { IFileSystemItem } from "../shared/IFileSystemItem";

export interface IStsProject {
  main: string;
  rootDir: IFileSystemItem;
}