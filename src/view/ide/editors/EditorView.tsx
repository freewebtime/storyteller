import * as React from 'react';
import { IProject } from '../../../data/api/project/IProject';
import { ICallback } from '../../../data/api/callback';
import { IProjectItem } from '../../../data/api/project/IProjectItem';
import { IEditorData } from '../../../data/api/ide/IEditorsPanel';
import { appConfig } from '../../../data/config/appConfig';
import { TextEditorView } from './TextEditorView';
import { StsEditorView } from './StsEditorView';
import { FolderEditorView } from './FolderEditorView';

export interface IEditorViewProps {
	editorData: IEditorData;
	project: IProject;
	callback: ICallback;
}

export class EditorView extends React.Component<IEditorViewProps> {

	render() {
		const editorData = this.props.editorData;
		const editorViewId = editorData.editorViewId;

		switch (editorViewId) {
			case appConfig.Editors.KnownEditors.TEXT_EDITOR: {
				return (
					<TextEditorView editorData={this.props.editorData} callback={this.props.callback} project={this.props.project} />
				);
			} 

			case appConfig.Editors.KnownEditors.STS_EDITOR: {
				return (
					<StsEditorView editorData={this.props.editorData} callback={this.props.callback} project={this.props.project} />
				);
			} 

			case appConfig.Editors.KnownEditors.FOLDER_EDITOR: {
				return (
					<FolderEditorView editorData={this.props.editorData} callback={this.props.callback} project={this.props.project} />
				);
			} 

			default: {
				return (
					<div>
						No editor found...
					</div>
				);
			} 
		}

	}
}
