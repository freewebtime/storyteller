import { IAppState } from "../api/IAppState";
import { IAssembly } from "../api/ide/IAssembly";
import { IProject, AssemlbyItemType, IFolder, IFile } from "../api/ide/IAssemblyItem";
import { calcRootAssemblyItems } from "../helpers/assemblyHeler";

const assemblyId = 'NewAssembly';
const assemblyName = 'New Assembly';
const newProjectId = 'NewProject';
const newProjectName = 'New Project';
const srcFolderId = 'src';
const srcFolderName = 'src';
const srcFileId = 'Source';
const srcFileName = 'Source.sts';

export const newProject: IProject = {
  id: newProjectId,
  shortId: newProjectId,
  name: newProjectName,
  assemlbyItemType: AssemlbyItemType.Project,
  subitems: {},
}

export const srcFolder: IFolder = {
  id: `${newProject.id}.${srcFolderId}`,
  shortId: srcFolderId,
  name: srcFolderName,
  parentId: newProject.id,
  assemlbyItemType: AssemlbyItemType.Folder,
  subitems: {},
}
newProject.subitems = {
  ...newProject.subitems,
  [srcFolder.id]: srcFolder.id,
}

export const srcFile: IFile = {
  id: `${srcFolder.id}.${srcFileId}`,
  shortId: srcFileId,
  name: srcFileName,
  parentId: srcFolder.id,
  assemlbyItemType: AssemlbyItemType.File,
  fileType: 'sts',
}
srcFolder.subitems = {
  ...srcFolder.subitems,
  [srcFile.id]: srcFile.id,
}

const assemlbyItems = {
  [newProject.id]: newProject,
  [srcFolder.id]: srcFolder,
  [srcFile.id]: srcFile,
}

export const emptyAssembly: IAssembly = {
  id: assemblyId,
  name: assemblyName,
  items: assemlbyItems,
  rootItems: calcRootAssemblyItems(assemlbyItems),
}

export const initialAppState: IAppState = {
  assembly: emptyAssembly,
}
