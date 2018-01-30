import * as vscode from 'vscode';
import { ICodeToken } from './api/ICodeToken';
import { parseFileContent } from './parser/stsParser';

export const compileStoryScript = (sourceCode: string) => {
	return parseFileContent(sourceCode);
}