import { combineReducers } from 'redux';
import { projectReducer } from './project/projectReducer';
import { ideReducer } from './ide/ideReducer';
import { IAppState } from '../api/IAppState';
import { IAction } from '../api/IAction';

const initialState: IAppState = {
  ide: {
    cardboards: {},
  },
}

export const appReducer = (state: IAppState = initialState, action: IAction) => {

  const newProject = projectReducer(state.project, action);
  if (newProject !== state.project) {
    const newValues: any = {
      project: newProject,
      ide: ideReducer(state.ide, newProject, action),
    }

    state = {
      ...state,
      ...newValues,
    }
  }

  return state;
}

