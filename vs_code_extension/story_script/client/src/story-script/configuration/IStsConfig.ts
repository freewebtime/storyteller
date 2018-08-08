export interface IStsConfig {
  name: string;
  author: string;
  rootDir: string;
  rootDirAbsolute: string;
  outDir: string;
  outDirAbsolute: string;
  sourceMap: boolean;
  exclude: string;
  entrypoint: string;
}