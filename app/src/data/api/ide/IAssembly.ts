import { IHash } from "../IHash";
import { IAssemblyItem } from "./IAssemblyItem";

export interface IAssembly {
  id: string;
  name: string;

  items: IHash<IAssemblyItem>;
  rootItems: string[];
}
