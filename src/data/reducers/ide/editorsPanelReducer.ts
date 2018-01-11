import { IEditorsPanel, IEditorData } from "../../api/ide/IEditorsPanel";
import { IAction } from "../../api/IAction";
import { IProject } from "../../api/project/IProject";
import { ICallback } from "../../api/callback";
import { editorWindowReducer, editorWindowActions } from "./editorWindowReducer";
import { appConfig } from "../../config/appConfig";
import { getEditorIdForProjectItem } from "../../helpers/projectHelper";

const emptyEditorsPanel: IEditorsPanel = {
	editors: {},
};

export const editorsPanelActions = {
	Types: {
		EDITOR_OPEN: 'EDITOR_OPEN',
		EDITOR_UPDATE: 'EDITOR_UPDATE',
		EDITOR_CLOSE: 'EDITOR_CLOSE',
		EDITOR_SELECT: 'EDITOR_SELECT',
	},

	Commands: {

		OpenEditor: (projectItemId: string, callback: ICallback) => {
			const action: IAction = {
				type: editorsPanelActions.Types.EDITOR_OPEN,
				payload: projectItemId,
			};

			callback(action);

			editorsPanelActions.Commands.SelectEditor(projectItemId, callback);
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

		SelectEditor: (editorId: string, callback: ICallback) => {
			const action: IAction = {
				type: editorsPanelActions.Types.EDITOR_SELECT,
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

				const editorIndex = Object.keys(state.editors).indexOf(editorId);
				
				let editors = { ...state.editors };
				delete editors[editorId];

				let selectedEditorId = state.selectedEditorId === editorId ? undefined : state.selectedEditorId;
				if (!selectedEditorId) {
					const keys = Object.keys(editors);
					if (keys.length > editorIndex) {
						selectedEditorId = keys[editorIndex];
					} else if (keys.length > 0) {
						selectedEditorId = keys[keys.length-1];
					} else {
						selectedEditorId = undefined;
					}
				}

				state = {
					...state,
					editors,
					selectedEditorId,
				};

			}

		} break;

		case editorsPanelActions.Types.EDITOR_OPEN: {

			const projectItemId = action.payload as string;
			const existedEditor = state.editors[projectItemId];
			
			if (existedEditor) {
				const newEditor = editorWindowReducer(existedEditor, action, project);
				if (newEditor !== existedEditor) {
					state = {
						...state,
						editors: {
							...state.editors,
							[projectItemId]: newEditor,
						},
					};
				}

			} else {
				const projectItem = project.items[projectItemId];
				const editorViewId = getEditorIdForProjectItem(projectItem);

				if (projectItem) {
					const newEditor: IEditorData = {
						id: projectItemId,
						name: projectItem.name,
						icon: 'file',
						editorViewId,
						projectItemId,
					};

					state = {
						...state,
						editors: {
							...state.editors,
							[projectItemId]: newEditor,
						},
					};
				}

			}

		} break;

		case editorsPanelActions.Types.EDITOR_SELECT: {

			const selectedEditorId = action.payload as string;
			if (selectedEditorId) {
				const editor = state.editors[selectedEditorId];
				if (editor) {
					const newValues = {};

					Object.keys(state.editors).map((editorId: string) => {
						const oldEditor = state.editors[editorId];
						const isSelected = oldEditor.id === selectedEditorId;

						if (isSelected !== oldEditor.isSelected) {
							newValues[editorId] = {
								...oldEditor,
								isSelected,
							};
						}

					});

					state = {
						...state,
						selectedEditorId,
						editors: {
							...state.editors,
							...newValues,
						}
					}; 

				}

			}

		} break;

		default: {

			let isChanged = false;
			const newValues = {};

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