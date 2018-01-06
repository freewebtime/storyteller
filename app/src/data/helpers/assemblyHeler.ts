import { IHash } from "../api/IHash";
import { IAssemblyItem } from "../api/ide/IAssemblyItem";
import { isNullOrEmpty } from "./index";
import { IAssembly } from "../api/ide/IAssembly";

export const calcRootAssemblyItems = (items: IHash<IAssemblyItem>): string[] => {
  return Object.keys(items).reduce((pv: string[], itemId: string) => {
    const item = items[itemId];
    if (isNullOrEmpty(item.parentId)) {
      return [...pv, itemId];
    }

    return pv;
  }, [])
}

export const findAssemblyItem = (itemId: string, assembly?: IAssembly): IAssemblyItem|undefined => {

  if (!assembly) {
    return undefined;
  }

  const items = assembly.items;
  if (items) {
    return items[itemId];
  }

  return undefined;

}
