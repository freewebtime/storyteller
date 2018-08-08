import { IAstNode } from "../astParsing/parsingApi";

const moduleHeader = `const stsUtils = require('storyscript');
context = {};`;

const importTemplate = (contextName: string, varName: string, importPath: string): string => {
  return `${contextName} = stsUtils.setValue(${contextName}, "${varName}", require("${importPath}"));`
}

const variableTemplate = (contextName: string, varName: string): string => {
  return `\r${contextName} = stsUtils.declare(${contextName}, "${varName}");`;
}

const addTextTemplate = (contextName: string, textValue: string): string => {
  var result = `${contextName} = stsUtils.addText(${contextName}, ${textValue});`;
  return result;
}

const mentionTemplate = (identifier: string): string => {
  return `\${stsUtils.objectToString(${identifier})}`;
}

const moduleFooter = "module.exports = {...context}";

export const jsCompilerTemplates = {
  moduleHeader,
  moduleFooter,

  importTemplate,
  variableTemplate,
  addTextTemplate,
  mentionTemplate,
}
