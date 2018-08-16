"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const IFileSystemItem_1 = require("storyscript/shared/IFileSystemItem");
const stsTokenizer_1 = require("storyscript/tokenizing/stsTokenizer");
const stsParser_1 = require("storyscript/parsing/stsParser");
const jsCompiler_1 = require("storyscript/compilation/jsCompiler");
const IStsProject_1 = require("../shared/IStsProject");
const fsUtils_1 = require("../fileSystem/fsUtils");
const execTreeParser_1 = require("storyscript/execTree/execTreeParser");
const compileProject = (project, config) => {
    if (!project) {
        return project;
    }
    if (!project.items) {
        return project;
    }
    // tokenize
    project = tokenizeProject(project);
    // parse
    project = parseProject(project);
    // parse exec tree
    project = parseExecTreeProject(project);
    // render
    project = renderProjectToJs(project);
    // save
    project = fsUtils_1.fsUtils.saveProject(project);
    return project;
    // compileFsItem(project, project.rootDir, config);
};
const tokenizeProject = (project) => {
    if (!project || !project.items) {
        return project;
    }
    let items = project.items.map((item) => {
        return tokenizeProjectItem(item);
    });
    project = Object.assign({}, project, { items: items });
    return project;
};
const tokenizeProjectItem = (projectItem) => {
    if (!projectItem) {
        return projectItem;
    }
    if (projectItem.type === IStsProject_1.StsProjectItemType.folder) {
        if (projectItem.subitems) {
            let subitems = projectItem.subitems.map((subitem) => {
                return tokenizeProjectItem(subitem);
            });
            projectItem = Object.assign({}, projectItem, { subitems: subitems });
        }
    }
    else {
        if (projectItem.fileContent) {
            try {
                let tokens = stsTokenizer_1.stsTokenizer.tokenizeCode(projectItem.fileContent);
                projectItem = Object.assign({}, projectItem, { tokens: tokens });
            }
            catch (error) {
                console.log(error);
            }
        }
    }
    return projectItem;
};
const parseProject = (project) => {
    if (!project || !project.items) {
        return project;
    }
    let items = project.items.map((item) => {
        return parseProjectItem(item);
    });
    project = Object.assign({}, project, { items: items });
    return project;
};
const parseProjectItem = (projectItem) => {
    if (!projectItem) {
        return projectItem;
    }
    if (projectItem.type === IStsProject_1.StsProjectItemType.folder) {
        if (projectItem.subitems) {
            let subitems = projectItem.subitems.map((subitem) => {
                return parseProjectItem(subitem);
            });
            projectItem = Object.assign({}, projectItem, { subitems: subitems });
        }
    }
    else {
        if (projectItem.tokens) {
            try {
                let moduleName = projectItem.fsItem ? projectItem.fsItem.name : 'unnamed';
                let parsingResult = stsParser_1.stsParser.parseModule(projectItem.tokens, moduleName);
                projectItem = Object.assign({}, projectItem, { ast: parsingResult.result });
            }
            catch (error) {
                console.log(error);
            }
        }
    }
    return projectItem;
};
const parseExecTreeProject = (project) => {
    if (!project || !project.items) {
        return project;
    }
    let items = project.items.map((item) => {
        return parseExecTreeProjectItem(item);
    });
    project = Object.assign({}, project, { items: items });
    return project;
};
const parseExecTreeProjectItem = (projectItem) => {
    if (!projectItem) {
        return projectItem;
    }
    if (projectItem.type === IStsProject_1.StsProjectItemType.folder) {
        if (projectItem.subitems) {
            let subitems = projectItem.subitems.map((subitem) => {
                return parseExecTreeProjectItem(subitem);
            });
            projectItem = Object.assign({}, projectItem, { subitems: subitems });
        }
    }
    else {
        if (projectItem.tokens) {
            try {
                let parsingResult = execTreeParser_1.execTreeParser.parseModule(projectItem.ast);
                projectItem = Object.assign({}, projectItem, { execTree: parsingResult.result });
            }
            catch (error) {
                console.log(error);
            }
        }
    }
    return projectItem;
};
const renderProjectToJs = (project) => {
    if (!project || !project.items) {
        return project;
    }
    let items = project.items.map((item) => {
        return renderProjectItemToJs(item);
    });
    project = Object.assign({}, project, { items: items });
    return project;
};
const renderProjectItemToJs = (projectItem) => {
    if (!projectItem) {
        return projectItem;
    }
    if (projectItem.type === IStsProject_1.StsProjectItemType.folder) {
        if (projectItem.subitems) {
            let subitems = projectItem.subitems.map((subitem) => {
                return renderProjectItemToJs(subitem);
            });
            projectItem = Object.assign({}, projectItem, { subitems: subitems });
        }
    }
    else {
        if (projectItem.ast) {
            try {
                let compiled = jsCompiler_1.jsCompiler.compile(projectItem.ast);
                projectItem = Object.assign({}, projectItem, { jsContent: compiled });
            }
            catch (error) {
                console.log(error);
            }
        }
    }
    return projectItem;
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
    compileProject,
    tokenizeProject,
    tokenizeProjectItem,
    parseProject,
    parseProjectItem,
    renderProjectToJs,
    renderProjectItemToJs,
};
//# sourceMappingURL=compileUtils.js.map