import * as vscode from 'vscode';
import { ICodeToken } from './api/ICodeToken';


const tokenizeLine = (line: string, lineNumber: number): ICodeToken[] => {
	
	const whitespaceCount = line.match(/^\s{0,2}/)[0].length;

	return [];
}

export const tokenizeCode = (sourceCode: string) => {
	// vscode.window.showInformationMessage('tokenizing source code');
	let lines = sourceCode.split(/\r?\n/g);
	var regex = /^[1-9]\d{0,2}$/g

	const codeTokens = lines.reduce((state: ICodeToken[], line: string, index: number) => {
		const lineTokens = tokenizeLine(line, index);
		
		const result = [
			...state,
			...lineTokens,
		];

		return result;
	}, []);

	codeTokens.map((token: ICodeToken) => {
		// console.log('codeToken is ', JSON.stringify(token));
	})
}

export const compileStoryScript = (sourceCode: string) => {
	tokenizeCode(sourceCode);
}