import { IProjectItem, ProjectItemType, IFile } from "../api/project/IProjectItem";
import { appConfig } from "../config/appConfig";

export const getEditorIdForProjectItem = (projectItem: IProjectItem) => {
	
	switch (projectItem.projectItemType) {
		case ProjectItemType.Folder:
			return appConfig.Editors.KnownEditors.FOLDER_EDITOR;
	
		case ProjectItemType.File: {
			const file = projectItem as IFile;
			if (file) {
				const fileType = file.fileType;

				const editorsByFileType = appConfig.Editors.EditorsByFileType;
				return editorsByFileType[fileType];
			}

			return appConfig.Editors.KnownEditors.TEXT_EDITOR;
		}

		default: return appConfig.Editors.KnownEditors.UNKNOWN;
	}

};