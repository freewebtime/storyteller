import * as React from 'react';
import { IProject } from '../../../data/api/project/IProject';
import { ICallback } from '../../../data/api/callback';
import { IProjectItem, IFile } from '../../../data/api/project/IProjectItem';
import { IEditorViewProps } from './EditorView';
import { appStyles } from '../../styles/appStyles';
import { Editor, EditorState } from 'draft-js';

export class TextEditorView extends React.Component<IEditorViewProps> {

	errorView = () => {
		return this.viewWrapper('Error occured while reading file');
	}

	viewWrapper = (children: any) => {
		return (
			<div style={appStyles.editorsArea.editorArea}>
				{children} 
			</div>
		);
	}

	editorView = (fileContent: any) => {
		return this.viewWrapper(fileContent);
	}

	render() {
		const editorData = this.props.editorData;
		const project = this.props.project;

		const projectItemId = editorData.projectItemId;
		const projectItem = project.items[projectItemId];
		const file = projectItem as IFile;

		if (!file) {
			return this.errorView();
		}

		const fileContent = file.fileContent;
		if (!fileContent) {
			return this.errorView();
		} 

		return this.editorView(fileContent);
	}
}
