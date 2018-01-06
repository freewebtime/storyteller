import { IHash } from "../api/IHash";
import { IAssemblyItem } from "../api/ide/IAssemblyItem";
import { isNullOrEmpty } from "./index";

export const calcRootAssemblyItems = (items: IHash<IAssemblyItem>): string[] => {
  return Object.keys(items).reduce((pv: string[], itemId: string) => {
    const item = items[itemId];
    if (isNullOrEmpty(item.parentId)) {
      return [...pv, itemId];
    }

    return pv;
  }, [])
}
