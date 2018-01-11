import * as React from 'react';
import { IProject } from '../../../data/api/project/IProject';
import { ICallback } from '../../../data/api/callback';
import { IProjectItem } from '../../../data/api/project/IProjectItem';
import { IFileEditorViewProps } from './EditorView';
import { appStyles } from '../../styles/appStyles';
import { TextEditorView } from './TextEditorView';

export class StsEditorView extends TextEditorView {
	editorView = (fileContent: any) => {
		return this.viewWrapper(fileContent);
	}
}
