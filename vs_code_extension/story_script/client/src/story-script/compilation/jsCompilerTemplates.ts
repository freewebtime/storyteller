import { IAstNode } from "../astParsing/parsingApi";

const stsUtils = 'stsUtils';

const moduleHeader = "const stsUtils = require('/lib/stsUtils.js');\r";

const importTemplate = (contextName: string, varName: string, importPath: string): string => {
  return `context = stsUtils.setValue(${contextName}, "${varName}", require("${importPath}"));`
}

const variableTemplate = (contextName: string, varName: string): string => {
  return `\rcontext = stsUtils.declare(${contextName}, "${varName}");`;
}

const addTextTemplate = (contextName: string, textValue: string): string => {
  return `context = stsUtils.addText(${contextName}, \`\${stsUtils.objectToString(${textValue})}\`);`;
}

const mentionTemplate = (identifier: string): string => {
  return `\${${identifier}}`;
}


export const jsCompilerTemplates = {
  moduleHeader,

  importTemplate,
  variableTemplate,
  addTextTemplate,
  mentionTemplate,
}
