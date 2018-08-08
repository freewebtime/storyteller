import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { fsUtils } from '../fileSystem/fsUtils';
import { configUtils } from '../configuration/configUtils';
import { IStsProject } from '../project/IStsProject';
import { IStsConfig } from '../configuration/IStsConfig';
import { projectUtils } from '../project/projectUtils';
import { IFileSystemItem, FileSystemItemType } from '../fileSystem/IFileSystemItem';
import { stsTokenizer } from '../parsing/stsTokenizer';
import { astParser } from '../astParsing/astParser';
import { jsCompiler } from './jsCompiler';

const compileProject = (project: IStsProject, config: IStsConfig) => {
  compileFsItem(project, project.rootDir, config);
}

const compileFsItem = (project: IStsProject, sourceItem: IFileSystemItem, config: IStsConfig) => {
  // check is it folder
  if (sourceItem.type === FileSystemItemType.folder) {
    if (sourceItem.subitems) {
      for (const subitemName in sourceItem.subitems) {
        const subitem = sourceItem.subitems[subitemName];
        compileFsItem(project, subitem, config);        
      }
    }
    return;
  }

  // check is it file
  if (sourceItem.type === FileSystemItemType.file) {
    compileFile(project, sourceItem, config);
  }
}

const compileFile = (project: IStsProject, sourceFile: IFileSystemItem, config: IStsConfig) => {
  const filePath = sourceFile.fullPath;
  if (!fs.existsSync(filePath)) {
    return;
  }

  try {
    // read file
    const fileContent = fs.readFileSync(filePath, 'utf8').toString();

    // tokenize file
    const tokens = stsTokenizer.tokenizeCode(fileContent);

    // save tokenized json file
    const tokensJson = JSON.stringify(tokens);
    const tokensJsonFileName = filePath + '.tokens.json';
    fs.writeFileSync(tokensJsonFileName, tokensJson);

    // parse tokenized code to ast
    const ast = astParser.parseModule(tokens, sourceFile.name);
    
    // save parsed json filed
    const astJson = JSON.stringify(ast);
    const astJsonFileName = filePath + '.ast.json';
    fs.writeFileSync(astJsonFileName, astJson);

    // generate javascript
    const compiledJs = jsCompiler.compile(ast.result);

    // save generated javascript
    const compiledJsFileName = filePath + '.compiled.js';
    fs.writeFileSync(compiledJsFileName, compiledJs, { encoding: 'utf8' });

    // generate codemaps

  } catch (error) {
    console.error(error);
  }
}

export const compileUtils = {
  compileProject
}