"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fsUtils_1 = require("../fileSystem/fsUtils");
const readProject = (config) => {
    const rootDir = fsUtils_1.fsUtils.getSourceFiles(config);
    if (!rootDir) {
        console.error("can't read file hierarhy");
        return undefined;
    }
    if (!config) {
        return undefined;
    }
    let result = {
        main: config.main,
        rootDir: rootDir,
    };
    return result;
};
exports.projectUtils = {
    readProject,
};
//# sourceMappingURL=projectUtils.js.map