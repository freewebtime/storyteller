import { IAppState } from '../api/IAppState';
import { IAction } from '../api/IAction';
import { initialAppState } from '../config/initialState';
import { projectReducer } from './project/projectReducer';
import { ideReducer } from './ide/ideReducer';

export const appReducer = (state: IAppState = initialAppState, action: IAction) => {

  if (state.project) {
    const newProject = projectReducer(state.project, action);
    if (state.project !== newProject) {
      state = {
        ...state,
        project: newProject,
      };
    }
	}

	const newIde = ideReducer(state.ide, action, state.project);
	if (newIde !== state.ide) {
		state = {
			...state,
			ide: newIde,
		};
	}

  return state;
};
