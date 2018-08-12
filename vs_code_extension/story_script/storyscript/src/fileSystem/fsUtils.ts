import { IFileSystemItem, FileSystemItemType } from "../shared/IFileSystemItem";
import * as fs from 'fs';
import * as path from 'path';
import { IHash } from "../shared/IHash";
import { IStsConfig } from "../configuration/IStsConfig";
import { IStsProject, IStsProjectItem, StsProjectItemType } from "../project/IStsProject";

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

      let relativePath = path.relative(config.rootDir, fullPath);
      let compilePath = config.outDir + '/' + relativePath;
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

  let relativePath = path.relative(config.rootDir, dirPath);
  let compilePath = config.outDir + '/' + relativePath;

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
    let result = readDirectory(config.rootDir, config, /\.git|\.vscode/, /.*\.sts$|.*\.стс$/);
    return result;
  } catch (error) {
    console.error(error);
  }

  return undefined;
}

const mkDirByPathSync = (targetDir: string, { isRelativeToScript = false } = {}) => {
  const sep = path.sep;
  const initDir = path.isAbsolute(targetDir) ? sep : '';
  const baseDir = isRelativeToScript ? __dirname : '.';

  return targetDir.split(sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(baseDir, parentDir, childDir);
    try {
      fs.mkdirSync(curDir);
    } catch (err) {
      if (err.code === 'EEXIST') { // curDir already exists!
        return curDir;
      }

      // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
      if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
        throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
      }

      const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
      if (!caughtErr || caughtErr && targetDir === curDir) {
        throw err; // Throw if it's just the last created dir.
      }
    }

    return curDir;
  }, initDir);
}

const copyDirectory = (fromPath, toPath) => {
  if (!fs.existsSync(fromPath)) {
    console.log('directory ' + toPath + ' does not exists');
    return;
  }

  if (!fs.statSync(fromPath).isDirectory()) {
    console.log(fromPath, 'is not a directory');
    return;
  }

  if (!fs.existsSync(toPath)) {
    console.log('directory ' + toPath + ' does not exists. creating it');
    fsUtils.mkDirByPathSync(toPath);
  }

  let itemNames = fs.readdirSync(fromPath);
  if (!itemNames || itemNames.length <= 0) {
    console.log(fromPath + 'does not have subitems');
    return;
  }

  itemNames.forEach((subitem) => {
    let subitemPath = fromPath + '/' + subitem;
    let targetSubitemPath = toPath + '/' + subitem;

    if (fs.statSync(subitemPath).isDirectory()) {
      copyDirectory(subitemPath, targetSubitemPath);
      return;
    }

    fs.writeFileSync(targetSubitemPath, fs.readFileSync(subitemPath));
  });
} 

const loadProjectFiles = (project: IStsProject): IStsProject => {
  if (!project) {
    return project;
  }

  // read all project items
  if (!project.items) {
    return project;
  }

  let projectItems = project.items.map((item: IStsProjectItem): IStsProjectItem => {
    return loadProjectItemFile(item);
  })

  project = {
    ...project,
    items: projectItems
  };

  return project;
}

const loadProjectItemFile = (projectItem: IStsProjectItem): IStsProjectItem => {
  if (projectItem.type === StsProjectItemType.folder) {
    if (projectItem.subitems) {
      let subitems = projectItem.subitems.map((subitem: IStsProjectItem) => {
        return loadProjectItemFile(subitem);
      });

      projectItem = {
        ...projectItem,
        subitems
      };
    }
  } else {
    try {
      if (!projectItem.fsItem) {
        return projectItem;
      }

      let filePath = projectItem.fsItem.fullPath;
      if (!fs.existsSync(filePath)) {
        return projectItem;
      }

      let fileContent = fs.readFileSync(filePath).toString();
      projectItem = {
        ...projectItem,
        fileContent: fileContent
      };

    } catch (error) {
      console.error(error);
    }
  }

  return projectItem;
}

const saveProject = (project: IStsProject): IStsProject => {
  if (!project || !project.items) {
    return project;
  }

  let items = project.items.map((item: IStsProjectItem): IStsProjectItem => {
    return saveProjectItem(item);
  });

  project = {
    ...project,
    items: items,
  };

  return project;
}

const saveProjectItem = (projectItem: IStsProjectItem): IStsProjectItem => {
  if (!projectItem) {
    return projectItem;
  }

  if (projectItem.type === StsProjectItemType.folder) {
    if (projectItem.subitems) {
      let subitems = projectItem.subitems.map((subitem: IStsProjectItem): IStsProjectItem => {
        return saveProjectItem(subitem);
      });

      projectItem = {
        ...projectItem,
        subitems: subitems,
      };
    }
  } else {
    // file
    try {
      if (projectItem.jsContent && projectItem.fsItem) {
        let filePath = projectItem.fsItem.compilePath;
        fs.writeFileSync(filePath, projectItem.jsContent);
      }

    } catch (error) {
      console.error(error);
    }
  }

  return projectItem;
}

export const fsUtils = {
  readDirectory,
  getSourceFiles,
  mkDirByPathSync,
  copyDirectory,
  loadProjectFiles,
  loadProjectItemFile,
  saveProject,
  saveProjectItem,
}