import { IEditorsPanel, IEditorWindow } from "../../api/ide/IEditorsPanel";
import { IAction } from "../../api/IAction";
import { IProject } from "../../api/project/IProject";
import { ICallback } from "../../api/callback";
import { editorWindowReducer, editorWindowActions } from "./editorWindowReducer";

const emptyEditorsPanel: IEditorsPanel = {
	editors: {},
};

export const editorsPanelActions = {
	Types: {
		EDITOR_OPEN: 'EDITOR_OPEN',
		EDITOR_UPDATE: 'EDITOR_UPDATE',
		EDITOR_CLOSE: 'EDITOR_CLOSE',
	},

	Commands: {

		OpenEditor: (projectItemId: string, callback: ICallback) => {
			const action: IAction = {
				type: editorsPanelActions.Types.EDITOR_OPEN,
				payload: projectItemId,
			};

			callback(action);

			editorWindowActions.Commands.SelectEditorWindow(projectItemId, callback);
		},

		UpdateEditor: (editorId: string, newValues: {}, callback: ICallback) => {
			const action: IAction = {
				type: editorsPanelActions.Types.EDITOR_UPDATE,
				payload: {editorId, newValues},
			};

			callback(action);
		},

		CloseEditor: (editorId: string, callback: ICallback) => {
			const action: IAction = {
				type: editorsPanelActions.Types.EDITOR_CLOSE,
				payload: editorId,
			};

			callback(action);
		},

	}
};

export const editorsPanelReducer = (state: IEditorsPanel = emptyEditorsPanel, action: IAction, project: IProject) => {
	
	switch (action.type) {
		case editorsPanelActions.Types.EDITOR_UPDATE: {

			if (action.payload) {
				const { projectItemId, newValues } = action.payload;

				if (projectItemId && newValues) {
					const projectItem = project.items[projectItemId];

					if (projectItem) {
						const existedEditor = state.editors[projectItemId];

						if (existedEditor) {
							state = {
								...state,
								editors: {
									...state.editors,
									[existedEditor.id]: {
										...existedEditor,
										...newValues,
									},
								},
							};
						}

					}

				}

			}

		} break;
	
		case editorsPanelActions.Types.EDITOR_CLOSE: {

			const editorId = action.payload;
			const existedEditor = state.editors[editorId];
			if (existedEditor) {

				let editors = { ...state.editors };
				delete editors[editorId];

				state = {
					...state,
					editors,
				};

			}

		} break;

		case editorsPanelActions.Types.EDITOR_OPEN: {

			const editorId = action.payload;
			const existedEditor = state.editors[editorId];
			
			if (existedEditor) {
				const newEditor = editorWindowReducer(existedEditor, action, project);
				if (newEditor !== existedEditor) {
					state = {
						...state,
						editors: {
							...state.editors,
							[editorId]: newEditor,
						},
					};
				}

			} else {
				const projectItemId = editorId;
				const projectItem = project.items[projectItemId];
				
				if (projectItem) {
					const newEditor: IEditorWindow = {
						id: editorId,
						name: projectItem.name, 
					};

					state = {
						...state,
						editors: {
							...state.editors,
							[editorId]: newEditor,
						},
					};
				}

			}

		} break;

		default: {

			const newValues = {};
			let isChanged = false;

			Object.keys(state.editors).map((editorId: string) => {
				const oldEditor = state.editors[editorId];
				const newEditor = editorWindowReducer(oldEditor, action, project);

				if (newEditor !== oldEditor) {
					isChanged = true;
					newValues[editorId] = newEditor;
				}

			});

			if (isChanged) {
				state = {
					...state,
					editors: {
						...state.editors,
						...newValues,
					}
				};
			}

		} break;
	}

	return state;
};