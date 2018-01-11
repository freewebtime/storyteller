import * as React from 'react';
import { IProject } from '../../../data/api/project/IProject';
import { ICallback } from '../../../data/api/callback';
import { IProjectItem, IFile } from '../../../data/api/project/IProjectItem';
import { IFileEditorViewProps } from './EditorView';
import { appStyles } from '../../styles/appStyles';
import { Editor, EditorState, ContentState, DraftBlockType } from 'draft-js';
import { IEditorData } from '../../../data/api/ide/IEditorsPanel';

interface ITextEditorViewState {
	editorState?: EditorState;
	file?: IFile;
	fileContent?: any;
}

export class TextEditorView extends React.Component<IFileEditorViewProps, ITextEditorViewState> {

	constructor(props: IFileEditorViewProps) {
		super(props);

		this.state = this.checkState({}, props);
	}

	checkState = (state: ITextEditorViewState, newProps: IFileEditorViewProps) => {
		const newFile = this.props.file;
		if (state.file === newFile) {
			return state;
		}

		const newFileContent = newFile.fileContent;
		if (state.fileContent === newFileContent) {
			return state;
		}

		let contentState: ContentState;
		if (Array.isArray(newFileContent)) {
			contentState = ContentState.createFromText(newFileContent.join('\n'), '\n');
		} else if (typeof newFileContent === 'string') {
			contentState = ContentState.createFromText(newFileContent);
		} else {
			contentState = ContentState.createFromText(newFileContent.toString());
		}

		const blockType = DraftBlockType.;

		const editorState: EditorState = EditorState.createWithContent(contentState);

		state = {
			...state,
			editorState,
			file: newFile,
			fileContent: newFileContent,
		};

		return state;
	}

	onEditContent = (editorState: EditorState) => {
		this.setState({
			...this.state,
			editorState,
		});
	}

	componentWillReceiveProps(nextProps: IFileEditorViewProps) {
		const newState = this.checkState(this.state, nextProps);
		if (this.state !== newState) {
			this.setState(newState);
		}
	}

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
		const project = this.props.project;
		const file = this.state.file;

		if (!file) {
			return this.errorView();
		}

		const fileContent = file.fileContent;
		if (!fileContent) {
			return this.errorView();
		} 

		return this.editorView(
			<Editor editorState={this.state.editorState} onChange={this.onEditContent} />
		);
	}
}
