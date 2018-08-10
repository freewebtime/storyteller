"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IFileSystemItem_1 = require("../shared/IFileSystemItem");
const fs = require("fs");
const path = require("path");
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
    return targetDir.split(sep).reduce((parentDir, childDir) => {
        const curDir = path.resolve(baseDir, parentDir, childDir);
        try {
            fs.mkdirSync(curDir);
        }
        catch (err) {
            if (err.code === 'EEXIST') {
                return curDir;
            }
            // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
            if (err.code === 'ENOENT') {
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
const copyDirectory = (fromPath, toPath) => {
    if (!fs.existsSync(fromPath)) {
        console.log('directory ' + toPath + ' does not exists');
        return;
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
exports.fsUtils = {
    readDirectory,
    getSourceFiles,
    mkDirByPathSync,
    copyDirectory,
};
//# sourceMappingURL=fsUtils.js.map