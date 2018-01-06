import { IAssembly } from "../../api/ide/IAssembly";
import { IAction } from "../../api/IAction";
import { projectsReducer, initialProjects } from "./projectsReducer";

export const initialAssembly: IAssembly = {
  id: 'NewAssembly',
  name: 'New Assembly',
  projects: initialProjects,
}

export const assemblyReducer = (state: IAssembly = initialAssembly, action: IAction) => {
  const newProjects = projectsReducer(state.projects, action);
  if (newProjects !== state.projects) {
    state = {
      ...state,
      projects: newProjects,
    }
  }

  return state;
}
