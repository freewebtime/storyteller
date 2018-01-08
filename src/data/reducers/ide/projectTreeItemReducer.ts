import { IAction } from "../../api/IAction";
import { IProjectItem, ProjectItemType } from "../../api/project/IProjectItem";
import { IHash } from "../../api/IHash";
import { ICallback } from "../../api/callback";
import { IProjectTreeItem, ProjectTreeItemType } from "../../api/ide/IProjectTree";

const emptyProjectItem: IProjectTreeItem = {
}; 

export const projectTreeItemActions = {
	Types: {
		PROJECT_TREE_ITEM_UPDATE: 'PROJECT_TREE_ITEM_UPDATE',
		PROJECT_TREE_ITEM_SELECT: 'PROJECT_TREE_ITEM_SELECT',
		PROJECT_TREE_ITEM_EDIT: 'PROJECT_TREE_ITEM_EDIT',
	},

	Commands: {
		
		UpdateTreeItem: (itemId: string, newValues: any, callback: ICallback) => {
			const action: IAction = {
				type: projectTreeItemActions.Types.PROJECT_TREE_ITEM_UPDATE,
				payload: {itemId, newValues}
			};

			callback(action);
		},

		SelectTreeItem: (itemId: string, callback: ICallback) => {
			const action: IAction = {
				type: projectTreeItemActions.Types.PROJECT_TREE_ITEM_SELECT,
				payload: itemId,
			};

			callback(action);
		},

		EditTreeItem: (itemId: string, callback: ICallback) => {
			const action: IAction = {
				type: projectTreeItemActions.Types.PROJECT_TREE_ITEM_EDIT,
				payload: itemId,
			};

			callback(action);
		},

	},

};

export const projectTreeItemReducer = (state: IProjectTreeItem = emptyProjectItem, action: IAction, projectItem: IProjectItem) => {
	const	projectTreeItemType = projectItem.projectItemType === ProjectItemType.File ? ProjectTreeItemType.File : ProjectTreeItemType.Folder;

	const data = state.data || {
		...state.data,
		id: projectItem.id,
		parentId: projectItem.parentId,
		name: projectItem.name,
		projectTreeItemType,
		subitems: projectItem.subitems,
	};

	if (data !== state.data || state.projectItem !== projectItem) {
		state = {
			...state,
			projectItem,
			data,
		};
	}

	switch (action.type) {
		case projectTreeItemActions.Types.PROJECT_TREE_ITEM_UPDATE: {

			if (action.payload) {
				const itemId = action.payload.itemId;

				if (itemId === data.id) {
					const newValues = action.payload.newValues;

					state = {
						...state,
						data: {
							...data,
							...newValues,
						}
					};
				}

			}

		} break;

		case projectTreeItemActions.Types.PROJECT_TREE_ITEM_SELECT: {

			const itemId = action.payload;
			if (itemId) {

				if (itemId === data.id) {
					state = {
						...state,
						data: {
							...data,
							isSelected: true,
						}
					};
				} else if (state.data.isSelected === true) {
					state = {
						...state,
						data: {
							...data,
							isSelected: false,
							isEditing: false,
						}
					};
				}

			}

		} break;

		case projectTreeItemActions.Types.PROJECT_TREE_ITEM_EDIT: {

			const itemId = action.payload;
			if (itemId) {

				if (itemId === data.id) {
					state = {
						...state,
						data: {
							...data,
							isEditing: true,
						}
					};
				} else if (state.data.isEditing === true) {
					state = {
						...state,
						data: {
							...data,
							isEditing: false,
						}
					};
				}

			}

		} break;

		default: break;
	}

	return state;
};

export const projectTreeItemsReducer = (state: IHash<IProjectTreeItem> = {}, action: IAction, projectItems: IHash<IProjectItem>) => {

	let isChanged = false;
	const newValues = {};

	Object.keys(projectItems).map((projectItemId: string) => {
		const projectItem = projectItems[projectItemId];
		const oldPti = state[projectItemId];
		const newPti = projectTreeItemReducer(oldPti, action, projectItem);
		
		if (oldPti !== newPti) {
			newValues[projectItemId] = newPti;
			isChanged = true;
		}
	});

	if (isChanged) {
		state = {
			...state,
			...newValues,
		};
	}

	return state;
};
