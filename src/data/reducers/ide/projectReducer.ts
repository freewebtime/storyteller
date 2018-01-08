import { IAction } from "../../api/IAction";
import { emptyProject } from "../../config/initialState";
import { IProject } from "../../api/ide/IProject";
import { projectItemsReducer } from "./projectItemReducer";

export const projectReducer = (state: IProject = emptyProject, action: IAction) => {

  const newItems = projectItemsReducer(state.items, action);
  if (newItems !== state.items) {

    state = {
      ...state,
      items: newItems,
    };
  }

  return state;
};
