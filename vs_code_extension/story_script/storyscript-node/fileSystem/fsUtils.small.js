"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
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
exports.fsUtils = {
    mkDirByPathSync,
    copyDirectory,
};
//# sourceMappingURL=fsUtils.small.js.map