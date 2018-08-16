"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configUtils_1 = require("./configuration/configUtils");
const projectUtils_1 = require("./project/projectUtils");
const compileUtils_1 = require("./compilation/compileUtils");
const fsUtils_1 = require("./fileSystem/fsUtils");
exports.compile = (rootPath, configPath) => {
    // load config
    const config = configUtils_1.configUtils.loadConfig(rootPath, configPath);
    if (!config) {
        console.error("can't load config at " + configPath);
        return undefined;
    }
    // read project sturcture
    let project = projectUtils_1.projectUtils.readProject(config);
    if (!project) {
        console.error("can't read project structure at " + config.rootDir);
        return undefined;
    }
    // load files content
    project = fsUtils_1.fsUtils.loadProjectFiles(project);
    project = compileUtils_1.compileUtils.compileProject(project, config);
};
exports.storyscript = {
    compile: exports.compile,
};
//# sourceMappingURL=index.js.map