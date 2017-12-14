import { IProject } from "../../api/project/IProject";
import { IAction } from "../../api/IAction";

const initialProject: IProject = {
  name: 'New project',
}

export const projectReducer = (state: IProject = initialProject, action: IAction) => {
  return state;
}
