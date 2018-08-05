import { IHash } from "../../shared/IHash";

export interface IStsProject {
  name: string;
  author: string;
  rootDir: string;
  entrypoint: string;

  files: IStsFile[];
  filesSorted: IHash<IStsFile>;
}

export interface IStsFile {
  name: string;
  fullName: string;
  type: StsFileType;
  path: string;
  content: string;
}

export enum StsFileType {
  content = 'content',
  storyscript = 'storyscript',
}