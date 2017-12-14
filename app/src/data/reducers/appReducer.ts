import { combineReducers } from 'redux';
import { projectReducer } from './project/projectReducer';
import { ideReducer } from './ide/ideReducer';

export const appReducer = combineReducers({
  project: projectReducer,
  ide: ideReducer,
});
