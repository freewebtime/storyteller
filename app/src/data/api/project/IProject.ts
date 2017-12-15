import { IHash } from "../IHash";
import { IItem } from "./IItem";

export interface IProject {
  name: string;
  items: IHash<IItem>;
  rootItems: IHash<string>;
}


