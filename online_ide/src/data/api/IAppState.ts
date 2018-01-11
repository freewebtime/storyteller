import { IProject } from "./project/IProject";
import { IIde } from "./ide/IIde";

export interface IAppState {
	project?: IProject;
	ide: IIde;
}
