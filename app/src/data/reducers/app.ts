import { combineReducers } from 'redux';
import { IAppState } from '../api/IAppState';
import { IAction } from '../api/IAction';
import { initialAppState } from '../config/initialState';
import { assemblyReducer } from './ide/assembly';

export const appReducer = (state: IAppState = initialAppState, action: IAction) => {

  if (state.assembly) {
    const newAssembly = assemblyReducer(state.assembly, action);
    if (state.assembly !== newAssembly) {
      state = {
        ...state,
        assembly: newAssembly,
      }
    }
  }

  return state;
}

