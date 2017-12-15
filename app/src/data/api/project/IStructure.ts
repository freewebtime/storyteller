import { IHash } from "../IHash";
import { IItem } from "./IItem";

export interface IStructure extends IItem {
  subitems: IHash<string>;
}
