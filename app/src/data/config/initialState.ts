import { IAppState } from "../api/IAppState";
import { calcRootAssemblyItems } from "../helpers/assemblyHeler";
import { IFolder, ProjectItemType, IFile } from "../api/ide/IProjectItem";
import { IProject } from "../api/ide/IProject";

const projectId = 'NewProject';
const projectName = 'New Project';
const projectRootId = projectId;
const projectRootName = projectName;
const srcFolderId = 'src';
const srcFolderName = 'src';
const srcFileId = 'Source';
const srcFileName = 'Source.sts';

export const projectRoot: IFolder = {
  id: projectRootId,
  shortId: projectRootId,
  name: projectRootName,
  projectItemType: ProjectItemType.Folder,
  subitems: {},
}

export const srcFolder: IFolder = {
  id: `${projectRoot.id}.${srcFolderId}`,
  shortId: srcFolderId,
  name: srcFolderName,
  parentId: projectRoot.id,
  projectItemType: ProjectItemType.Folder,
  subitems: {},
}
projectRoot.subitems = {
  ...projectRoot.subitems,
  [srcFolder.id]: srcFolder.id,
}

export const srcFile: IFile = {
  id: `${srcFolder.id}.${srcFileId}`,
  shortId: srcFileId,
  name: srcFileName,
  parentId: srcFolder.id,
  projectItemType: ProjectItemType.File,
  fileType: 'sts',
}
srcFolder.subitems = {
  ...srcFolder.subitems,
  [srcFile.id]: srcFile.id,
}

const projectItems = {
  [projectRoot.id]: projectRoot,
  [srcFolder.id]: srcFolder,
  [srcFile.id]: srcFile,
}

export const emptyProject: IProject = {
  id: projectId,
  name: projectName,
  items: projectItems,
  rootItems: calcRootAssemblyItems(projectItems),
}

export const initialAppState: IAppState = {
  project: emptyProject,
}
