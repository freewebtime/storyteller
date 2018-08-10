const moduleHeader = `const __environment = require('storyscript/out/environment');
context = {};`;

const importTemplate = (contextName: string, varName: string, importPath: string): string => {
  return `${contextName} = __environment.setValue(${contextName}, "${varName}", require("${importPath}"));`
}

const variableTemplate = (contextName: string, varName: string): string => {
  return `\r${contextName} = __environment.declare(${contextName}, "${varName}");`;
}

const addTextTemplate = (contextName: string, textValue: string): string => {
  var result = `${contextName} = __environment.addText(${contextName}, ${textValue});`;
  return result;
}

const mentionTemplate = (identifier: string): string => {
  return `\${__environment.objectToString(${identifier})}`;
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
