import { IHash } from "../IHash";
import { IObject } from "./IObject";

export interface IProject {
  name: string;
  objects: IHash<IObject>;
}


