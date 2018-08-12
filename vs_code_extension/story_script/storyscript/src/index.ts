import { configUtils } from "./configuration/configUtils";
import { projectUtils } from "./project/projectUtils";
import { compileUtils } from "./compilation/compileUtils";
import { fsUtils } from "./fileSystem/fsUtils";

export const compile = (rootPath, configPath: string) => {
  // load config
  const config = configUtils.loadConfig(rootPath, configPath);
  if (!config) {
    console.error("can't load config at " + configPath);
    return undefined;
  }

  // read project sturcture
  let project = projectUtils.readProject(config);
  if (!project) {
    console.error("can't read project structure at " + config.rootDir);
    return undefined;
  }

  // load files content
  project = fsUtils.loadProjectFiles(project);

  project = compileUtils.compileProject(project, config);
}

export const storyscript = {
  compile,
}