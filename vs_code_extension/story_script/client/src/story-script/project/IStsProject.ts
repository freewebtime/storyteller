import { IHash } from "../../shared/IHash";
import { IFileSystemItem } from "../fileSystem/IFileSystemItem";

export interface IStsProject {
  name: string;
  author: string;
  entrypoint: string;
  rootDir: IFileSystemItem;
}