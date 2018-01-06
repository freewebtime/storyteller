import { IAssembly } from "../../api/ide/IAssembly";
import { IAction } from "../../api/IAction";
import { initialProject } from "./project";
import { assemblyItemsReducer } from "./assemblyItems";

export const initialAssembly: IAssembly = {
  id: 'NewAssembly',
  name: 'New Assembly',
  items: {
    [initialProject.id]: initialProject,
  },
  rootItems: [
    initialProject.id,
  ],
}

export const assemblyReducer = (state: IAssembly = initialAssembly, action: IAction) => {

  const newItems = assemblyItemsReducer(state.items, action);
  if (newItems !== state.items) {

    const rootItems = Object.keys(newItems).reduce((pv: string[], itemId: string) => {
      const item = newItems[itemId];
      if (!item.parentId) {
        return [...pv, itemId];
      }

      return pv;
    }, [])

    state = {
      ...state,
      items: newItems,
      rootItems: rootItems,
    }
  }

  return state;
}
