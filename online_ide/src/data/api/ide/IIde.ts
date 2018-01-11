import { IProject } from "../project/IProject";
import { IProjectItem } from "../project/IProjectItem";
import { IHash } from "../IHash";
import { IAppState } from "../IAppState";
import { IProjectTree } from "./IProjectTree";
import { IEditorsPanel } from "./IEditorsPanel";

export interface IIde {
	project?: IProject;
	projectTree?: IProjectTree;
	editorsPanel: IEditorsPanel;
}