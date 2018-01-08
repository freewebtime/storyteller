import { IAction } from "../../api/IAction";
import { IHash } from "../../api/IHash";
import { IProjectItem } from "../../api/project/IProjectItem";

export const projectItemsReducer = (state: IHash<IProjectItem> = {}, action: IAction) => {
  let isChanged = false;
  const newValues = {};

  Object.keys(state).map((itemId: string) => {
    const item = state[itemId];
    const newItem = projectItemReducer(item, action);
    if (item !== newItem) {
      isChanged = true;
      newValues[itemId] = newItem;
    }
  });

  if (isChanged) {
    state = {
      ...state,
      ...newValues,
    };
  }

  return state;
};

export const projectItemReducer = (state: IProjectItem, action: IAction) => {
  return state;
};
