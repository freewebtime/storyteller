import {
  stsTokenizer
} from "./parsing/stsTokenizer";
import {
  stsCompiler
} from "./program/stsCompiler";
import {
  astParser
} from "./astParsing/astParser";
import {
  IStsConfig
} from "./configuration/IStsConfig";
import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';

export const compileProject = () => {
  // get config
  const config = readStsConfig();
  return config;

  // compile
}

export const readStsConfig = (): IStsConfig => {
  const configFileName = `${vscode.workspace.rootPath}/stsconfig.json`;
  const files = fs.readdirSync(vscode.workspace.rootPath);
  
  if (!fs.existsSync(configFileName)) {
    console.error(`can't find config file ${configFileName}`);
    return undefined;
  }

  try {
    const configContentBuffer = fs.readFileSync(configFileName, 'utf8');
    const configContent = configContentBuffer.toString();
    const result = JSON.parse(configContent) as IStsConfig;
    return result;
  } catch (error) {
    console.error(`can't read config file ${configFileName}`, error);
  }
}

export const compileStoryscriptModule = (sourceCode: string, filePath: string, fileName: string) => {
  const tokens = stsTokenizer.tokenizeCode(sourceCode);
  const parsed = astParser.parse(tokens);

  return parsed;
}