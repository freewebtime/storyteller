import { IHash } from "../IHash";

export interface IStructure {
  items: IHash<IStructureItem>;
  rootItems: IHash<string>;
}

export interface IStructureItem {
  id: string;
  parentId?: string;
  subitems?: IHash<string>;
}
