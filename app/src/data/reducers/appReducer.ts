import { combineReducers } from 'redux';
import { IAppState } from '../api/IAppState';
import { IAction } from '../api/IAction';
import { initialAppState } from '../config/initialState';
import { projectReducer } from './ide/projectReducer';

export const appReducer = (state: IAppState = initialAppState, action: IAction) => {

  if (state.project) {
    const newProject = projectReducer(state.project, action);
    if (state.project !== newProject) {
      state = {
        ...state,
        project: newProject,
      }
    }
  }

  return state;
}

