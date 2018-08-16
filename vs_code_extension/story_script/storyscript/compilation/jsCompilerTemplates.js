"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moduleHeader = `const __environment = require('storyscript/environment');
context = {};`;
const importTemplate = (contextName, varName, importPath) => {
    return `${contextName} = __environment.setValue(${contextName}, "${varName}", require("${importPath}"));`;
};
const variableTemplate = (contextName, varName) => {
    return `\r${contextName} = __environment.declare(${contextName}, "${varName}");`;
};
const addTextTemplate = (contextName, textValue) => {
    var result = `${contextName} = __environment.addText(${contextName}, ${textValue});`;
    return result;
};
const mentionTemplate = (identifier) => {
    return `\${__environment.objectToString(${identifier})}`;
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