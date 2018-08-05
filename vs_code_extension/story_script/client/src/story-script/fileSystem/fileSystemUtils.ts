import { IFileSystemItem, FileSystemItemType } from "./IFileSystemItem";
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { IHash } from "../../shared/IHash";

export const readDirectory = (dirPath: string, excludePattern?: RegExp, includePattern?: RegExp): IFileSystemItem => {
  
  if (!fs.existsSync(dirPath)) {
    return undefined;
  }

  const dirName: string = path.basename(dirPath);
  let subitems: IHash<IFileSystemItem> = {};

  const subitemNames = fs.readdirSync(dirPath);

  subitemNames.forEach((subitemName: string) => {
    if (subitemName === '.' || subitemName === '..') {
      return;
    }

    if (excludePattern) {
      if (excludePattern.test(subitemName)) {
        return;
      }
    }

    const fullPath = dirPath + '/' + subitemName;

    let subitem: IFileSystemItem;

    // check is directory
    if (fs.statSync(fullPath).isDirectory()) {
      // read dir with it's subitems
      subitem = readDirectory(fullPath, excludePattern, includePattern);
      if (!subitem) {
        return;
      }
    }
    // otherwise it's file
    else {
      if (includePattern) {
        if (!includePattern.test(subitemName)) {
          return;
        }
      }

      subitem = {
        fullPath: fullPath,
        name: subitemName,
        type: FileSystemItemType.file,
      }
    }

    // save result
    subitems = {
      ...subitems,
      [subitem.name]: subitem
    }
  });

  let result: IFileSystemItem = {
    name: dirName,
    fullPath: dirPath,
    type: FileSystemItemType.folder,
    subitems: subitems
  }

  return result;
}

export const testApi = () => {
  let rootPath = vscode.workspace.rootPath;
  let dirResult = fs.readdirSync(rootPath, 'utf8').toString();

  try {

    let stsFiles = readDirectory(rootPath, /\.git|\.vscode/, /.*\.sts|.*\.стс/);
    console.log(rootPath, dirResult, stsFiles);

  } catch (error) {
    console.log(error);
  }

}