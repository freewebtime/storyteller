import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';
import { IStsConfig } from './IStsConfig';

const readStsConfig = (): IStsConfig => {
  const configFileName = `${vscode.workspace.rootPath}/stsconfig.json`;

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

  return undefined;
}

export const configUtils = {
  readStsConfig
}