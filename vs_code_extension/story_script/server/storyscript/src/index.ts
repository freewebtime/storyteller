import { configUtils } from "./configuration/configUtils";
import { projectUtils } from "./project/projectUtils";
import { compileUtils } from "./compilation/compileUtils";

export const compile = (rootPath, configPath: string) => {
  const config = configUtils.loadConfig(rootPath, configPath);
  if (!config) {
    console.error("can't load config at " + configPath);
    return undefined;
  }

  const project = projectUtils.readProject(config);
  if (!project) {
    console.error("can't read project structure at " + config.rootDir);
    return undefined;
  }

  compileUtils.compileProject(project, config);
}

export const storyscript = {
  compile,
}