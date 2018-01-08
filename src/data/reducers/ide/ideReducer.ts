import { IAction } from "../../api/IAction";
import { IIde } from "../../api/ide/IIde";
import { IAppState } from "../../api/IAppState";
import { projectTreeReducer } from "./projectTreeReducer";
import { IProject } from "../../api/project/IProject";
import { editorsPanelReducer } from "./editorsPanelReducer";

const emptyIde: IIde = {
	editorsPanel: {
		editors: {},
	},
};

const ideActions = {
	Types: {

	},
};

export const ideReducer = (state: IIde = emptyIde, action: IAction, project: IProject) => {

	const projectTree = projectTreeReducer(state.projectTree, action, project);
	const editorsPanel = editorsPanelReducer(state.editorsPanel, action, project);
	if (project !== state.project || state.projectTree !== projectTree || editorsPanel !== state.editorsPanel) {
		state = {
			...state,
			project,
			projectTree,
			editorsPanel,
		};
	}

	return state;
};