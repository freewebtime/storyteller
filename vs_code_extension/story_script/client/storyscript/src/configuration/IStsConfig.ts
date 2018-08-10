export interface IStsConfig {
  rootDir: string;
  outDir: string;

  sourceMap: boolean;
  tokens: boolean;
  ast: boolean;

  exclude?: string[];
  include?: string[];

  main: string;
}