import { combineReducers } from 'redux';
import { IAppState } from '../api/IAppState';
import { IAction } from '../api/IAction';
import { initialAssembly, assemblyReducer } from './ide/assembly';

const initialAppState: IAppState = {
  assembly: initialAssembly,
}

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

