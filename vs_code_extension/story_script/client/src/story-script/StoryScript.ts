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
import { IHash } from "../shared/IHash";
import { IStsFile, IStsProject, StsFileType } from "./project/IStsProject";
import { testApi } from "./fileSystem/fileSystemUtils";

export const compileProject = () => {
  testApi();
  
  return undefined;

  let project = readProject();
  return project;
}

export const readProject = (): IStsProject => {
  // get config
  const config = readStsConfig();

  vscode.workspace.findFiles('**/*.sts', config.exclude).then(
    (filesUri: vscode.Uri[]) => {
      let fileNames: string[];
      filesUri.forEach((value: vscode.Uri) => {
        fileNames = [
          ...fileNames,
          value.path
        ];
      });

      let filesResult = readProjectFiles(fileNames);

      let project: IStsProject = {
        author: config.author,
        name: config.name,
        rootDir: config.rootDir,
        entrypoint: config.entrypoint,
        files: filesResult.files,
        filesSorted: filesResult.filesSorted,
      };

      return project;
    },

    (reason: any) => {
      console.error('error during searching files to compile', reason);
    }

  );

  return undefined;
}

export const readProjectFiles = (fileNames: string[]): {files: IStsFile[], filesSorted: IHash<IStsFile>} => {
  let files: IStsFile[];
  let filesSorted: IHash<IStsFile>;

  fileNames.forEach((fileName: string) => {
    try {
      const fileBuffer = fs.readFileSync(fileName, 'utf8');
      const fileContent = fileBuffer.toString();
      
      let fileType: StsFileType = StsFileType.content;
      const extension = path.extname(fileName);
      if (extension === 'sts' || extension === 'стс') {
        fileType = StsFileType.storyscript;
      }

      const stsFile: IStsFile = {
        content: fileContent,
        fullName: fileName,
        name: path.basename(fileName),
        path: path.dirname(fileName),
        type: fileType,
      }

      files = [
        ...files,
        stsFile
      ];
      filesSorted = {
        ...filesSorted,
        [fileName]: stsFile
      };

    } catch (error) {
      console.error(`error during reading file ${fileName}`, error);
    }
  });

  return {
    files, 
    filesSorted
  }
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