import * as vscode from 'vscode';
import { ICodeToken } from './api/ICodeToken';


const tokenizeLine = (line: string, lineNumber: number): ICodeToken[] => {
	
	const step1 = line.match(/^(?:((?: {2})+)|(\t)+)?(.*)/);
	const whitespace = step1[1] || step1[2];
	const indent = step1[1] 
		? (step1[1].length / 2)
		: (step1[2] ? step1[2].length : 0)
	const lineContent = step1[3];

	return [];
}

export const tokenizeCode = (sourceCode: string) => {
	// vscode.window.showInformationMessage('tokenizing source code');
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
		// console.log('codeToken is ', JSON.stringify(token));
	})
}

export const compileStoryScript = (sourceCode: string) => {
	tokenizeCode(sourceCode);
}