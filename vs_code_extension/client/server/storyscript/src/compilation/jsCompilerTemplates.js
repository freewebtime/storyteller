"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moduleHeader = `const stsUtils = require('storyscript');
context = {};`;
const importTemplate = (contextName, varName, importPath) => {
    return `${contextName} = stsUtils.setValue(${contextName}, "${varName}", require("${importPath}"));`;
};
const variableTemplate = (contextName, varName) => {
    return `\r${contextName} = stsUtils.declare(${contextName}, "${varName}");`;
};
const addTextTemplate = (contextName, textValue) => {
    var result = `${contextName} = stsUtils.addText(${contextName}, ${textValue});`;
    return result;
};
const mentionTemplate = (identifier) => {
    return `\${stsUtils.objectToString(${identifier})}`;
};
const moduleFooter = "module.exports = {...context}";
exports.jsCompilerTemplates = {
    moduleHeader,
    moduleFooter,
    importTemplate,
    variableTemplate,
    addTextTemplate,
    mentionTemplate,
};
//# sourceMappingURL=jsCompilerTemplates.js.map