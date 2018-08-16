"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IStsProject_1 = require("../shared/IStsProject");
exports.stsProjectFactory = {
    createProject: (main, rootDir, items) => {
        return {
            main: main,
            rootDir: rootDir,
            items: items,
        };
    },
    createProjectItem: (fsItem, type, fileContent, ast, subitems, tokens, jsContent) => {
        return {
            fsItem: fsItem,
            type: type,
            fileContent: fileContent,
            ast: ast,
            subitems: subitems,
            tokens: tokens,
            jsContent
        };
    },
    createProjectModule: (fsItem, fileContent, ast, tokens, jsContent) => {
        return exports.stsProjectFactory.createProjectItem(fsItem, IStsProject_1.StsProjectItemType.module, fileContent, ast, undefined, tokens, jsContent);
    },
    createProjectItemFolder: (fsItem, subitems) => {
        return exports.stsProjectFactory.createProjectItem(fsItem, IStsProject_1.StsProjectItemType.folder, undefined, undefined, subitems, undefined, undefined);
    },
};
//# sourceMappingURL=stsProjectFactory.js.map