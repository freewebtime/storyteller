"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const IFileSystemItem_1 = require("../shared/IFileSystemItem");
const stsTokenizer_1 = require("../tokenizing/stsTokenizer");
const stsParser_1 = require("../parsing/stsParser");
const jsCompiler_1 = require("./jsCompiler");
const compileProject = (project, config) => {
    compileFsItem(project, project.rootDir, config);
};
const compileFsItem = (project, sourceItem, config) => {
    // check is it folder
    if (sourceItem.type === IFileSystemItem_1.FileSystemItemType.folder) {
        if (!fs.existsSync(path.dirname(sourceItem.compilePath))) {
            fs.mkdirSync(sourceItem.compilePath);
        }
        if (sourceItem.subitems) {
            for (const subitemName in sourceItem.subitems) {
                const subitem = sourceItem.subitems[subitemName];
                compileFsItem(project, subitem, config);
            }
        }
        return;
    }
    // check is it file
    if (sourceItem.type === IFileSystemItem_1.FileSystemItemType.file) {
        compileFile(sourceItem, config);
    }
};
const compileFile = (sourceFile, config) => {
    const filePath = sourceFile.fullPath;
    if (!fs.existsSync(filePath)) {
        return;
    }
    try {
        // read file
        const fileContent = fs.readFileSync(filePath, 'utf8').toString();
        const compilePath = sourceFile.compilePath;
        // tokenize file
        const tokens = stsTokenizer_1.stsTokenizer.tokenizeCode(fileContent);
        // save tokenized json file
        if (config.tokens) {
            const tokensJson = JSON.stringify(tokens);
            const tokensJsonFileName = compilePath + '.tokens.json';
            fs.writeFileSync(tokensJsonFileName, tokensJson);
        }
        // parse tokenized code to ast
        const ast = stsParser_1.stsParser.parseModule(tokens, sourceFile.name);
        // save parsed json filed
        if (config.ast) {
            const astJson = JSON.stringify(ast);
            const astJsonFileName = compilePath + '.ast.json';
            fs.writeFileSync(astJsonFileName, astJson);
        }
        // generate javascript
        const compiledJs = jsCompiler_1.jsCompiler.compile(ast.result);
        // save generated javascript
        const compiledJsFileName = compilePath;
        fs.writeFileSync(compiledJsFileName, compiledJs, { encoding: 'utf8' });
        // generate codemaps
    }
    catch (error) {
        console.error(error);
    }
};
exports.compileUtils = {
    compileProject
};
//# sourceMappingURL=compileUtils.js.map