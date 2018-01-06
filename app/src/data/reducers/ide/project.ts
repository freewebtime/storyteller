import { IProject, AssemlbyItemType, IFolder } from "../../api/ide/IAssemblyItem";
import { IAction } from "../../api/IAction";

const newProjectId = 'NewProject';

export const srcFolder: IFolder = {
  id: `${newProjectId}.src`,
  shortId: 'src',
  name: 'src',
  assemlbyItemType: AssemlbyItemType.Folder,
  subitems: {}
}

export const initialProject: IProject = {
  id: newProjectId,
  name: newProjectId,
  shortId: newProjectId,
  assemlbyItemType: AssemlbyItemType.Project,
  subitems: {
    [srcFolder.id]: srcFolder.id,
  },
}

export const projectReducer = (state: IProject = initialProject, action: IAction) => {
  return state;
}
