import { IAppState } from "../api/IAppState";
import { createPath } from "../helpers/fileSystemHelper";
import { IProject } from "../api/project/IProject";
import { IFile, IFolder, ProjectItemType } from "../api/project/IProjectItem";
import { IIde } from "../api/ide/IIde";
import { IEditorsPanel } from "../api/ide/IEditorsPanel";

const projectId = 'NewProject';
const projectName = 'New Project';
const projectRootId = projectId;
const projectRootName = projectName;
const srcFolderId = 'src';
const srcFolderName = 'src';
const srcFileId = 'Source.sts';
const srcFileName = 'Source.sts';

export const projectRoot: IFolder = {
  id: projectRootId,
  shortId: projectRootId,
  name: projectRootName,
  projectItemType: ProjectItemType.Folder,
  subitems: {},
};

export const srcFolder: IFolder = {
  id: createPath(projectRoot.id, srcFolderId),
  shortId: srcFolderId,
  name: srcFolderName,
  parentId: projectRoot.id,
  projectItemType: ProjectItemType.Folder,
  subitems: {},
};
projectRoot.subitems = {
  ...projectRoot.subitems,
  [srcFolder.id]: srcFolder.id,
};

export const srcFile: IFile = {
  id: createPath(srcFolder.id, srcFileId),
  shortId: srcFileId,
  name: srcFileName,
  parentId: srcFolder.id,
  projectItemType: ProjectItemType.File,
  fileType: 'sts',
};
srcFolder.subitems = {
  ...srcFolder.subitems,
  [srcFile.id]: srcFile.id,
};

const projectItems = {
  [projectRoot.id]: projectRoot,
  [srcFolder.id]: srcFolder,
  [srcFile.id]: srcFile,
};

export const emptyProject: IProject = {
  id: projectId,
  name: projectName,
  items: projectItems,
};

const emptyEditorsPanel: IEditorsPanel = {
	editors: {},
};

const emptyIde: IIde = {
	editorsPanel: emptyEditorsPanel,
};

export const initialAppState: IAppState = {
	project: emptyProject,
	ide: emptyIde,
};
