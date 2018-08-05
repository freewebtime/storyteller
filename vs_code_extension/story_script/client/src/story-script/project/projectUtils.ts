import { fsUtils } from "../fileSystem/fsUtils";
import { IStsProject } from "./IStsProject";
import { configUtils } from "../configuration/configUtils";
import { IStsConfig } from "../configuration/IStsConfig";

const readProject = (config: IStsConfig): IStsProject => {
  const rootDir = fsUtils.getSourceFiles();

  if (!rootDir) {
    console.error("can't read file hierarhy");
    return undefined;
  }

  if (!config) {
    return undefined;
  }

  let result: IStsProject = {
    name: config.name,
    author: config.author,
    entrypoint: config.entrypoint,
    rootDir: rootDir,
  }

  return result;
}

export const projectUtils = {
  readProject,
}
