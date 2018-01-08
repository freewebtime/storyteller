import { IAction } from "../../api/IAction";
import { IIde } from "../../api/ide/IIde";
import { IAppState } from "../../api/IAppState";
import { projectTreeReducer } from "./projectTreeReducer";
import { IProject } from "../../api/project/IProject";

const emptyIde: IIde = {
};

const ideActions = {
	Types: {

	},
};

export const ideReducer = (state: IIde = emptyIde, action: IAction, project: IProject) => {

	const projectTree = projectTreeReducer(state.projectTree, action, project);
	if (project !== state.project || state.projectTree !== projectTree) {
		state = {
			...state,
			project,
			projectTree,
		};
	}

	return state;
};