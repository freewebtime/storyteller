import * as React from 'react';
import { IProject } from '../../../data/api/project/IProject';
import { ICallback } from '../../../data/api/callback';
import { IProjectItem, IFile, IFolder } from '../../../data/api/project/IProjectItem';
import { IEditorData } from '../../../data/api/ide/IEditorsPanel';
import { appConfig } from '../../../data/config/appConfig';
import { TextEditorView } from './TextEditorView';
import { StsEditorView } from './StsEditorView';
import { FolderEditorView } from './FolderEditorView';

export interface IFileEditorViewProps {
	file: IFile;
	project: IProject;
	callback: ICallback;
}
export interface IFolderEditorViewProps {
	folder: IFolder;
	project: IProject;
	callback: ICallback;
}

export interface IEditorSelectorViewProps {
	editorData: IEditorData;
	project: IProject;
	callback: ICallback;
}

export class EditorView extends React.Component<IEditorSelectorViewProps> {

	errorView = (children?: any) => {
		return (
			<div>
				{children ? children : 'No editor found...'}
			</div>
		);
	}

	render() {
		const editorData = this.props.editorData;
		const editorViewId = editorData.editorViewId;
		const projectItemId = editorData.projectItemId;
		const projectItem = this.props.project.items[projectItemId];

		if (!projectItem) {
			return this.errorView('no project item found');
		}

		const file = projectItem as IFile;
		const folder = projectItem as IFolder;

		switch (editorViewId) {
			case appConfig.Editors.KnownEditors.TEXT_EDITOR: {

				return (
					<TextEditorView file={file} callback={this.props.callback} project={this.props.project} />
				);
			} 

			case appConfig.Editors.KnownEditors.STS_EDITOR: {
				return (
					<StsEditorView file={file} callback={this.props.callback} project={this.props.project} />
				);
			} 

			case appConfig.Editors.KnownEditors.FOLDER_EDITOR: {
				return (
					<FolderEditorView folder={folder} callback={this.props.callback} project={this.props.project} />
				);
			} 

			default: {
				return this.errorView();
			} 
		}

	}
}
