import { IHash } from "../api/IHash";
import { isNullOrEmpty } from "./index";
import { IProjectItem } from "../api/project/IProjectItem";
import { IProject } from "../api/project/IProject";

export const calcRootAssemblyItems = (items: IHash<IProjectItem>): string[] => {
  return Object.keys(items).reduce((pv: string[], itemId: string) => {
    const item = items[itemId];
    if (isNullOrEmpty(item.parentId)) {
      return [...pv, itemId];
    }

    return pv;
  }, []);
};

export const findAssemblyItem = (itemId: string, assembly?: IProject): IProjectItem|undefined => {

  if (!assembly) {
    return undefined;
  }

  const items = assembly.items;
  if (items) {
    return items[itemId];
  }

  return undefined;

};
