import { IProject } from "../../api/project/IProject";
import { IAction } from "../../api/IAction";
import { itemsReducer } from "./itemsReducer";
import { IItem } from "../../api/project/IItem";
import { IHash } from "../../api/IHash";

const initialProject: IProject = {
  name: 'New project',
  items: {},
  rootItems: {},
}

const updateRootItems = (state: IHash<string>, items: IHash<IItem>): IHash<string> => {
  Object.keys(items).map((itemId: string) => {
    const item = items[itemId];
    if (item.parentId && state[item.id]) {
      state = {...state};
      delete state[item.id];
    }
    else if (!item.parentId && !state[item.id]) {
      state = {
        ...state,
        [itemId]: item.id,
      }
    }
  });

  return state;
}

const updateItems = (state: IProject, action: IAction): IProject => {
  const newItems = itemsReducer(state.items, action);
  if (newItems !== state.items) {
    state = {
      ...state,
      items: newItems,
      rootItems: updateRootItems(state.rootItems, newItems),
    }
  }

  return state;
}

export const projectReducer = (state: IProject = initialProject, action: IAction) => {
  state = updateItems(state, action);
  return state;
}

