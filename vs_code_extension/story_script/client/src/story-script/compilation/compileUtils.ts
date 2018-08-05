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
    const tokensJsonFileName = filePath + '.json';
    fs.writeFileSync(tokensJsonFileName, tokensJson);

    // parse tokenized code to ast
    astParser.parse(tokens);

    // generate javascript

    // generate codemaps

  } catch (error) {
    console.error(error);
  }
}

export const compileUtils = {
  compileProject
}