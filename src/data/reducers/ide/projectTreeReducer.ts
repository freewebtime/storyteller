import { IAction } from "../../api/IAction";
import { IProject } from "../../api/project/IProject";
import { projectTreeItemsReducer } from "./projectTreeItemReducer";
import { IProjectTree } from "../../api/ide/IProjectTree";

const emptyProjectTree: IProjectTree = {
};

export const projectTreeReducer = (state: IProjectTree = emptyProjectTree, action: IAction, project: IProject) => {
	const projectItems = projectTreeItemsReducer(state.projectItems, action, project.items);
	if (state.projectItems !== projectItems || state.project !== project) {
		state = {
			...state,
			project,
			projectItems,
		};
	}

	return state;
};
