import { IHash } from "../../api/IHash";
import { IProject } from "../../api/ide/IProject";
import { IAction } from "../../api/IAction";

export const initialProject: IProject = {
  id: 'NewProject',
  name: 'New Project',

  items: {},
  rootItems: {},
}

export const initialProjects: IHash<IProject> = {
  [initialProject.id]: initialProject,
}

export const projectsReducer = (state: IHash<IProject> = {}, action: IAction) => {

  const newValues = {}
  let isChanged = false;

  Object.keys(state).map((projectId: string) => {
    const project = state[projectId];
    const newProj = projectReducer(project, action);

    if (project !== newProj) {
      isChanged = true;
      newValues[projectId] = newProj;
    }
  })

  if (isChanged) {
    state = {
      ...state,
      ...newValues,
    }
  }

  return state;
}

export const projectReducer = (state: IProject, action: IAction) => {
  return state;
}


