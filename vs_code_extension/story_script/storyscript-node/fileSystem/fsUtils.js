"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IFileSystemItem_1 = require("storyscript/shared/IFileSystemItem");
const fs = require("fs");
const path = require("path");
const IStsProject_1 = require("../shared/IStsProject");
const readDirectory = (dirPath, config, excludePattern, includePattern) => {
    if (!fs.existsSync(dirPath)) {
        return undefined;
    }
    const dirName = path.basename(dirPath);
    let subitems = {};
    const subitemNames = fs.readdirSync(dirPath);
    subitemNames.forEach((subitemName) => {
        if (subitemName === '.' || subitemName === '..') {
            return;
        }
        if (excludePattern) {
            if (excludePattern.test(subitemName)) {
                return;
            }
        }
        const fullPath = dirPath + '/' + subitemName;
        let subitem;
        // check is directory
        if (fs.statSync(fullPath).isDirectory()) {
            // read dir with it's subitems
            subitem = readDirectory(fullPath, config, excludePattern, includePattern);
            if (!subitem) {
                return;
            }
        }
        // otherwise it's file
        else {
            if (includePattern) {
                if (!includePattern.test(subitemName)) {
                    return;
                }
            }
            let relativePath = path.relative(config.rootDir, fullPath);
            let compilePath = config.outDir + '/' + relativePath;
            compilePath = path.dirname(compilePath) + '/' + path.basename(compilePath, path.extname(compilePath)) + '.js';
            subitem = {
                fullPath: fullPath,
                relativePath: relativePath,
                compilePath: compilePath,
                name: subitemName,
                type: IFileSystemItem_1.FileSystemItemType.file,
            };
        }
        // save result
        subitems = Object.assign({}, subitems, { [subitem.name]: subitem });
    });
    let relativePath = path.relative(config.rootDir, dirPath);
    let compilePath = config.outDir + '/' + relativePath;
    let result = {
        name: dirName,
        fullPath: dirPath,
        relativePath: relativePath,
        compilePath: compilePath,
        type: IFileSystemItem_1.FileSystemItemType.folder,
        subitems: subitems
    };
    return result;
};
const getSourceFiles = (config) => {
    try {
        let result = readDirectory(config.rootDir, config, /\.git|\.vscode/, /.*\.sts$|.*\.стс$/);
        return result;
    }
    catch (error) {
        console.error(error);
    }
    return undefined;
};
const mkDirByPathSync = (targetDir, { isRelativeToScript = false } = {}) => {
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    const baseDir = isRelativeToScript ? __dirname : '.';
    targetDir = path.normalize(targetDir);
    return targetDir.split(sep).reduce((parentDir, childDir) => {
        const curDir = path.resolve(baseDir, parentDir, childDir);
        try {
            fs.mkdirSync(curDir);
        }
        catch (err) {
            if (err.code === 'EEXIST') { // curDir already exists!
                return curDir;
            }
            // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
            if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
                throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
            }
            const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
            if (!caughtErr || caughtErr && targetDir === curDir) {
                throw err; // Throw if it's just the last created dir.
            }
        }
        return curDir;
    }, initDir);
};
const copyDirectory = (fromPath, toPath, excludePattern, includePattern) => {
    if (!fs.existsSync(fromPath)) {
        console.log('directory ' + toPath + ' does not exists');
        return;
    }
    if (excludePattern) {
        for (let i = 0; i < excludePattern.length; i++) {
            const pattern = excludePattern[i];
            if (pattern.test(fromPath)) {
                return;
            }
        }
    }
    if (includePattern) {
        for (let i = 0; i < includePattern.length; i++) {
            const pattern = includePattern[i];
            if (!pattern.test(fromPath)) {
                return;
            }
        }
    }
    if (!fs.statSync(fromPath).isDirectory()) {
        console.log(fromPath, 'is not a directory');
        return;
    }
    if (!fs.existsSync(toPath)) {
        console.log('directory ' + toPath + ' does not exists. creating it');
        exports.fsUtils.mkDirByPathSync(toPath);
    }
    let itemNames = fs.readdirSync(fromPath);
    if (!itemNames || itemNames.length <= 0) {
        console.log(fromPath + 'does not have subitems');
        return;
    }
    itemNames.forEach((subitem) => {
        let subitemPath = fromPath + '/' + subitem;
        let targetSubitemPath = toPath + '/' + subitem;
        if (fs.statSync(subitemPath).isDirectory()) {
            copyDirectory(subitemPath, targetSubitemPath);
            return;
        }
        fs.writeFileSync(targetSubitemPath, fs.readFileSync(subitemPath));
    });
};
const loadProjectFiles = (project) => {
    if (!project) {
        return project;
    }
    // read all project items
    if (!project.items) {
        return project;
    }
    let projectItems = project.items.map((item) => {
        return loadProjectItemFile(item);
    });
    project = Object.assign({}, project, { items: projectItems });
    return project;
};
const loadProjectItemFile = (projectItem) => {
    if (projectItem.type === IStsProject_1.StsProjectItemType.folder) {
        if (projectItem.subitems) {
            let subitems = projectItem.subitems.map((subitem) => {
                return loadProjectItemFile(subitem);
            });
            projectItem = Object.assign({}, projectItem, { subitems });
        }
    }
    else {
        try {
            if (!projectItem.fsItem) {
                return projectItem;
            }
            let filePath = projectItem.fsItem.fullPath;
            if (!fs.existsSync(filePath)) {
                return projectItem;
            }
            let fileContent = fs.readFileSync(filePath).toString();
            projectItem = Object.assign({}, projectItem, { fileContent: fileContent });
        }
        catch (error) {
            console.error(error);
        }
    }
    return projectItem;
};
const saveProject = (project) => {
    if (!project || !project.items) {
        return project;
    }
    let items = project.items.map((item) => {
        return saveProjectItem(item);
    });
    project = Object.assign({}, project, { items: items });
    return project;
};
const saveProjectItem = (projectItem) => {
    if (!projectItem) {
        return projectItem;
    }
    if (projectItem.type === IStsProject_1.StsProjectItemType.folder) {
        if (projectItem.subitems) {
            let subitems = projectItem.subitems.map((subitem) => {
                return saveProjectItem(subitem);
            });
            projectItem = Object.assign({}, projectItem, { subitems: subitems });
        }
    }
    else {
        // file
        try {
            if (projectItem.jsContent && projectItem.fsItem) {
                let filePath = projectItem.fsItem.compilePath;
                fs.writeFileSync(filePath, projectItem.jsContent);
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    return projectItem;
};
exports.fsUtils = {
    readDirectory,
    getSourceFiles,
    mkDirByPathSync,
    copyDirectory,
    loadProjectFiles,
    loadProjectItemFile,
    saveProject,
    saveProjectItem,
};
//# sourceMappingURL=fsUtils.js.map