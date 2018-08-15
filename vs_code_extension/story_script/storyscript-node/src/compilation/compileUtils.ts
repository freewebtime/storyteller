import * as fs from 'fs';
import * as path from 'path';
import { IStsConfig } from 'storyscript/out/configuration/IStsConfig';
import { IFileSystemItem, FileSystemItemType } from 'storyscript/out/shared/IFileSystemItem';
import { stsTokenizer } from 'storyscript/out/tokenizing/stsTokenizer';
import { stsParser } from 'storyscript/out/parsing/stsParser';
import { jsCompiler } from 'storyscript/out/compilation/jsCompiler';
import { IStsProject, IStsProjectItem, StsProjectItemType } from '../shared/IStsProject';
import { fsUtils } from '../fileSystem/fsUtils';

const compileProject = (project: IStsProject, config: IStsConfig): IStsProject => {
  if (!project) {
    return project;
  }

  if (!project.items) {
    return project;
  }

  // tokenize
  project = tokenizeProject(project);

  // parse
  project = parseProject(project);

  // render
  project = renderProjectToJs(project);

  // save
  project = fsUtils.saveProject(project);

  return project;

  // compileFsItem(project, project.rootDir, config);
}

const tokenizeProject = (project: IStsProject): IStsProject => {
  if (!project || !project.items) {
    return project;
  }

  let items = project.items.map((item: IStsProjectItem) => {
    return tokenizeProjectItem(item);
  })

  project = {
    ...project,
    items: items
  };

  return project;
}
const tokenizeProjectItem = (projectItem: IStsProjectItem): IStsProjectItem => {
  if (!projectItem) {
    return projectItem;
  }

  if (projectItem.type === StsProjectItemType.folder) {
    if (projectItem.subitems) {
      let subitems = projectItem.subitems.map((subitem: IStsProjectItem): IStsProjectItem => {
        return tokenizeProjectItem(subitem);
      });

      projectItem = {
        ...projectItem,
        subitems: subitems
      };
    }
  } else {
    if (projectItem.fileContent) {
      try {
        let tokens = stsTokenizer.tokenizeCode(projectItem.fileContent);
        projectItem = {
          ...projectItem,
          tokens: tokens,
        };
      } catch (error) {
        console.log(error);
      }
    }
  }

  return projectItem;
}

const parseProject = (project: IStsProject): IStsProject => {
  if (!project || !project.items) {
    return project;
  }

  let items = project.items.map((item: IStsProjectItem) => {
    return parseProjectItem(item);
  })

  project = {
    ...project,
    items: items
  };

  return project;
}
const parseProjectItem = (projectItem: IStsProjectItem): IStsProjectItem => {
  if (!projectItem) {
    return projectItem;
  }

  if (projectItem.type === StsProjectItemType.folder) {
    if (projectItem.subitems) {
      let subitems = projectItem.subitems.map((subitem: IStsProjectItem): IStsProjectItem => {
        return parseProjectItem(subitem);
      });

      projectItem = {
        ...projectItem,
        subitems: subitems
      };
    }
  } else {
    if (projectItem.tokens) {
      try {
        let moduleName = projectItem.fsItem ? projectItem.fsItem.name : 'unnamed';
        let parsingResult = stsParser.parseModule(projectItem.tokens, moduleName);
        projectItem = {
          ...projectItem,
          ast: parsingResult.result,
        };
      } catch (error) {
        console.log(error);
      }
    }
  }

  return projectItem;
}

const renderProjectToJs = (project: IStsProject): IStsProject => {
  if (!project || !project.items) {
    return project;
  }

  let items = project.items.map((item: IStsProjectItem) => {
    return renderProjectItemToJs(item);
  })

  project = {
    ...project,
    items: items
  };

  return project;
}
const renderProjectItemToJs = (projectItem: IStsProjectItem): IStsProjectItem => {
  if (!projectItem) {
    return projectItem;
  }

  if (projectItem.type === StsProjectItemType.folder) {
    if (projectItem.subitems) {
      let subitems = projectItem.subitems.map((subitem: IStsProjectItem): IStsProjectItem => {
        return renderProjectItemToJs(subitem);
      });

      projectItem = {
        ...projectItem,
        subitems: subitems
      };
    }
  } else {
    if (projectItem.ast) {
      try {
        let compiled: string = jsCompiler.compile(projectItem.ast);
        projectItem = {
          ...projectItem,
          jsContent: compiled,
        };

      } catch (error) {
        console.log(error);
      }
    }
  }

  return projectItem;
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
  compileProject,

  tokenizeProject,
  tokenizeProjectItem,

  parseProject,
  parseProjectItem,

  renderProjectToJs,
  renderProjectItemToJs,
}