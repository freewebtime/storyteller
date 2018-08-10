import { fsUtils } from "../fileSystem/fsUtils";
import { IStsProject } from "./IStsProject";
import { IStsConfig } from "../configuration/IStsConfig";

const readProject = (config: IStsConfig): IStsProject => {
  const rootDir = fsUtils.getSourceFiles(config);

  if (!rootDir) {
    console.error("can't read file hierarhy");
    return undefined;
  }

  if (!config) {
    return undefined;
  }

  let result: IStsProject = {
    main: config.main,
    rootDir: rootDir,
  }

  return result;
}

export const projectUtils = {
  readProject,
}
