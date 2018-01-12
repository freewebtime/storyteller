import * as vscode from 'vscode';
import { ICodeToken } from './api/ICodeToken';


const tokenizeLine = (line: string, lineNumber: number): ICodeToken[] => {
	
	return [];
}

export const tokenizeCode = (sourceCode: string) => {
	vscode.window.showInformationMessage('tokenizing source code');
	let lines = sourceCode.split(/\r?\n/g);

	const codeTokens = lines.reduce((state: ICodeToken[], line: string, index: number) => {
		const lineTokens = tokenizeLine(line, index);
		
		const result = [
			...state,
			...lineTokens,
		];

		return result;
	}, []);

	codeTokens.map((token: ICodeToken) => {
		console.log('codeToken is ', JSON.stringify(token));
	})
}

export const compileStoryScript = (sourceCode: string) => {
	tokenizeCode(sourceCode);
}