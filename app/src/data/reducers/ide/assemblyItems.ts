import { IAssemblyItem } from "../../api/ide/IAssemblyItem";
import { IAction } from "../../api/IAction";
import { IHash } from "../../api/IHash";

export const assemblyItemsReducer = (state: IHash<IAssemblyItem> = {}, action: IAction) => {
  let isChanged = false;
  const newValues = {};

  Object.keys(state).map((itemId: string) => {
    const item = state[itemId];
    const newItem = assemblyItemReducer(item, action);
    if (item !== newItem) {
      isChanged = true;
      newValues[itemId] = newItem;
    }
  })

  if (isChanged) {
    state = {
      ...state,
      ...newValues,
    }
  }

  return state;
}

export const assemblyItemReducer = (state: IAssemblyItem, action: IAction) => {
  return state;
}
