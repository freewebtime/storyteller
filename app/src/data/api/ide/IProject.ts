import { IHash } from "../IHash";
import { IProjectItem } from "./IProjectItem";

export interface IProject {
  id: string;
  name: string;

  items: IHash<IProjectItem>;
  rootItems: IHash<string>;
}

