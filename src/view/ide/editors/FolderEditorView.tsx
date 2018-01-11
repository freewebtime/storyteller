import * as React from 'react';
import { IProject } from '../../../data/api/project/IProject';
import { ICallback } from '../../../data/api/callback';
import { IProjectItem } from '../../../data/api/project/IProjectItem';
import { IFileEditorViewProps, IFolderEditorViewProps } from './EditorView';
import { appStyles } from '../../styles/appStyles';

export class FolderEditorView extends React.Component<IFolderEditorViewProps> {

	render() {
		return (
			<div style={appStyles.editorsArea.editorArea}>
				Folder editor view content
			</div>
		);
	}
}
