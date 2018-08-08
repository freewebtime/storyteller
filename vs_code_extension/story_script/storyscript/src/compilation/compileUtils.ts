import * as fs from 'fs';
import * as path from 'path';
import { IStsConfig } from '../configuration/IStsConfig';
import { IFileSystemItem, FileSystemItemType } from '../shared/IFileSystemItem';
import { stsTokenizer } from '../tokenizing/stsTokenizer';
import { stsParser } from '../parsing/stsParser';
import { jsCompiler } from './jsCompiler';
import { IStsProject } from '../project/IStsProject';

const compileProject = (project: IStsProject, config: IStsConfig) => {
  compileFsItem(project, project.rootDir, config);
}

const compileFsItem = (project: IStsProject, sourceItem: IFileSystemItem, config: IStsConfig) => {
  // check is it folder
  if (sourceItem.type === FileSystemItemType.folder) {
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
  if (sourceItem.type === FileSystemItemType.file) {
    compileFile(sourceItem, config);
  }
}

const compileFile = (sourceFile: IFileSystemItem, config: IStsConfig) => {
  const filePath = sourceFile.fullPath;
  if (!fs.existsSync(filePath)) {
    return;
  }

  try {
    // read file
    const fileContent = fs.readFileSync(filePath, 'utf8').toString();

    const compilePath = sourceFile.compilePath;

    // tokenize file
    const tokens = stsTokenizer.tokenizeCode(fileContent);

    // save tokenized json file
    if (config.tokens) {
      const tokensJson = JSON.stringify(tokens);
      const tokensJsonFileName = compilePath + '.tokens.json';
      fs.writeFileSync(tokensJsonFileName, tokensJson);
    }

    // parse tokenized code to ast
    const ast = stsParser.parseModule(tokens, sourceFile.name);
    
    // save parsed json filed
    if (config.ast) {
      const astJson = JSON.stringify(ast);
      const astJsonFileName = compilePath + '.ast.json';
      fs.writeFileSync(astJsonFileName, astJson);
    }

    // generate javascript
    const compiledJs = jsCompiler.compile(ast.result);

    // save generated javascript
    const compiledJsFileName = compilePath;
    fs.writeFileSync(compiledJsFileName, compiledJs, { encoding: 'utf8' });

    // generate codemaps

  } catch (error) {
    console.error(error);
  }
}

export const compileUtils = {
  compileProject
}