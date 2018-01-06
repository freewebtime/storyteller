import { IProject, AssemlbyItemType } from "../../api/ide/IAssemblyItem";
import { IAction } from "../../api/IAction";

export const initialProject: IProject = {
  id: 'NewProject',
  name: 'New project',
  shortId: 'NewProject',
  assemlbyItemType: AssemlbyItemType.Project,
  subitems: {},
}

export const projectReducer = (state: IProject = initialProject, action: IAction) => {
  return state;
}
