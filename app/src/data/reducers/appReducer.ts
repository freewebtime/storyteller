import { combineReducers } from 'redux';
import { projectReducer } from './project/projectReducer';

export const appReducer = combineReducers({
    // resources: appResourcesReducer,
    project: projectReducer,
});
