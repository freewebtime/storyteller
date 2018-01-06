import { IHash } from "../IHash";
import { IProject } from "./IProject";

export interface IAssembly {
  id: string;
  name: string;

  projects: IHash<IProject>;
}
