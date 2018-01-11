const knownFileTypes = {
	TEXT_FILE: 'TEXT_FILE',
	STS_FILE: 'STS_FILE',
};

const knownEditors = {
	UNKNOWN: 'unknown',
	TEXT_EDITOR: 'textEditor',
	STS_EDITOR: 'stsEditor',
	FOLDER_EDITOR: 'folderEditor',
};

export const appConfig = {
  isSaveToLocalStorage: true,
  isLoadFromLocalStorage: true,

	PathSeparator: '/',
	
	Files: {
		KnownFileTypes: knownFileTypes,
	},

	Editors: {
		KnownEditors: knownEditors,
		EditorsByFileType: {
			[knownFileTypes.TEXT_FILE]: knownEditors.TEXT_EDITOR,
			[knownFileTypes.STS_FILE]: knownEditors.STS_EDITOR,
		},	
	},

};
