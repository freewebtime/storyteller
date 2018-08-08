import { configUtils } from "./configuration/configUtils";
import { compileUtils } from "./compilation/compileUtils";
import { projectUtils } from "./project/projectUtils";

export const compileProject = () => {
  const config = configUtils.readStsConfig();

  if (!config) {
    return undefined;
  }

  let project = projectUtils.readProject(config);
  if (!project) {
    return undefined;
  }

  compileUtils.compileProject(project, config);
}
