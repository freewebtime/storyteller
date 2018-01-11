import * as React from 'react';
import { IProject } from '../../../data/api/project/IProject';
import { ICallback } from '../../../data/api/callback';
import { IProjectItem } from '../../../data/api/project/IProjectItem';
import { IEditorViewProps } from './EditorView';
import { appStyles } from '../../styles/appStyles';

export class StsEditorView extends React.Component<IEditorViewProps> {

	render() {
		return (
			<div style={appStyles.editorsArea.editorArea}>
				Sts editor view content
			</div>
		);
	}
}
