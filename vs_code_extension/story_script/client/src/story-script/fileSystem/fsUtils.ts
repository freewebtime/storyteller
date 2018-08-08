import { IFileSystemItem, FileSystemItemType } from "./IFileSystemItem";
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { IHash } from "../../shared/IHash";
import { IStsConfig } from "../configuration/IStsConfig";

const readDirectory = (dirPath: string, config: IStsConfig, excludePattern?: RegExp, includePattern?: RegExp): IFileSystemItem => {
  
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
      subitem = readDirectory(fullPath, config, excludePattern, includePattern);
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

      let relativePath = path.relative(config.rootDirAbsolute, fullPath);
      let compilePath = config.outDirAbsolute + '/' + relativePath;
      compilePath = path.dirname(compilePath) + '/' + path.basename(compilePath, path.extname(compilePath)) + '.js';

      subitem = {
        fullPath: fullPath,
        relativePath: relativePath,
        compilePath: compilePath,
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

  let relativePath = path.relative(config.rootDirAbsolute, dirPath);
  let compilePath = config.outDirAbsolute + '/' + relativePath;

  let result: IFileSystemItem = {
    name: dirName,
    fullPath: dirPath,
    relativePath: relativePath,
    compilePath: compilePath,
    type: FileSystemItemType.folder,
    subitems: subitems
  }

  return result;
}

const getSourceFiles = (config: IStsConfig): IFileSystemItem => {
  try {
    let result = readDirectory(config.rootDirAbsolute, config, /\.git|\.vscode/, /.*\.sts$|.*\.стс$/);
    return result;
  } catch (error) {
    console.error(error);
  }

  return undefined;
}

export const fsUtils = {
  readDirectory,
  getSourceFiles,
}