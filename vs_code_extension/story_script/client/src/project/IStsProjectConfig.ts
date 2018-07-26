import { IHash } from "../shared/IHash";

export interface IStsProjectConfig {
  rootPath: string;
  entrypointUri: string;
}

export enum ProjectFileTypes {
  folder = 'folder',
  file = 'file',
}

export interface IProjectFile {
  name: string;
  path: string;
  type: ProjectFileTypes;
  subitems?: IHash<IProjectFile>;
}

export interface IStsProject {
  rootPath: string;
  entrypoint: string;
  files: IHash<IProjectFile>;
}