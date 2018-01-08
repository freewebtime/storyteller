import { IProject } from "../project/IProject";
import { IProjectItem } from "../project/IProjectItem";
import { IHash } from "../IHash";
import { IAppState } from "../IAppState";
import { IProjectTree } from "./IProjectTree";

export interface IIde {
	project?: IProject;
	projectTree?: IProjectTree;
}