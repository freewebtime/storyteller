"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fsUtils_1 = require("../fileSystem/fsUtils");
const stsProjectFactory_1 = require("./stsProjectFactory");
const IFileSystemItem_1 = require("storyscript/shared/IFileSystemItem");
exports.projectUtils = {
    readProject: (config) => {
        const rootDir = fsUtils_1.fsUtils.getSourceFiles(config);
        if (!rootDir) {
            console.error("can't read file hierarhy");
            return undefined;
        }
        if (!config) {
            return undefined;
        }
        let projectItems = exports.projectUtils.createProjectItems([rootDir]);
        let result = stsProjectFactory_1.stsProjectFactory.createProject(config.main, rootDir, projectItems);
        return result;
    },
    createProjectItems: (fsItems) => {
        if (!fsItems) {
            return undefined;
        }
        let result = fsItems.map((fsItem) => {
            let projectItem;
            if (fsItem.type === IFileSystemItem_1.FileSystemItemType.folder) {
                let fsSubitems;
                if (fsItem.subitems) {
                    for (const key in fsItem.subitems) {
                        let fsSubitem = fsItem.subitems[key];
                        fsSubitems = fsSubitems || [];
                        fsSubitems = [
                            ...fsSubitems,
                            fsSubitem
                        ];
                    }
                }
                let subitems;
                if (fsSubitems) {
                    subitems = exports.projectUtils.createProjectItems(fsSubitems);
                }
                projectItem = stsProjectFactory_1.stsProjectFactory.createProjectItemFolder(fsItem, subitems);
                return projectItem;
            }
            else {
                // fsItem is file
                let projectItem = stsProjectFactory_1.stsProjectFactory.createProjectModule(fsItem, undefined, undefined, undefined, undefined);
                return projectItem;
            }
        });
        return result;
    },
};
//# sourceMappingURL=projectUtils.js.map