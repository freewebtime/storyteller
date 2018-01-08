import { IEditorWindow } from "../../api/ide/IEditorsPanel";
import { IAction } from "../../api/IAction";
import { IProject } from "../../api/project/IProject";
import { ICallback } from "../../api/callback";

export const editorWindowActions = {
	Types: {
		EDITOR_WINDOW_UPDATE: 'EDITOR_WINDOW_UPDATE',
		EDITOR_WINDOW_SELECT: 'EDITOR_WINDOW_SELECT',
	},

	Commands: {

		UpdateEditorWindow: (editorId: string, newValues: {}, callback: ICallback) => {
			const action: IAction = {
				type: editorWindowActions.Types.EDITOR_WINDOW_UPDATE,
				payload: { editorId, newValues }
			};

			callback(action);
		},

		SelectEditorWindow: (editorId: string, callback: ICallback) => {
			const action: IAction = {
				type: editorWindowActions.Types.EDITOR_WINDOW_SELECT,
				payload: editorId,
			};

			callback(action);
		},

	}
};

export const editorWindowReducer = (state: IEditorWindow, action: IAction, project: IProject) => {

	switch (action.type) {
		
		case editorWindowActions.Types.EDITOR_WINDOW_UPDATE: {

			if (action.payload) {
				const { editorId, newValues } = action.payload;

				if (editorId === state.id) {
					state = {
						...state,
						...newValues,
					};
				}

			}

		} break;

		case editorWindowActions.Types.EDITOR_WINDOW_SELECT: {

			if (action.payload) {
				const editorId = action.payload;
				const isSelected = editorId === state.id;
				state = {
					...state,
					isSelected,
				};

			}

		} break;

		default: break;
	}

	return state;
};