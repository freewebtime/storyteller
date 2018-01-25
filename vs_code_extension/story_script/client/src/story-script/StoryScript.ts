import * as vscode from 'vscode';
import { ICodeToken } from './api/ICodeToken';
import { parseFileContent } from './parser/stsParser';

const extractLineContent = (line: string = '') => {
	const match = line.match(/^(?:((?: {2})+)|(\t)+)?(.*)/);
	const whitespace = match[1] || match[2];
	const indent = match[1]
		? (match[1].length / 2)
		: (match[2] ? match[2].length : 0)
	const lineContent = match[3];

	return {indent, lineContent, whitespace};
}

const extractEndlineComment = (lineContent: string = '') => {
	const match1 = lineContent.match(/([^\/{2}]+)?(.*)?/);
	const codeContent = match1[1];
	const endlineComment = match1[2];

	return {codeContent, endlineComment};
}

const checkContentType = (codeContent: string = '') => {
	const match = codeContent.match(/\s*(\* [\w.]+:)(.*)/);
	const itemContent = match ? match[1] : undefined;
	const literalContent = match ? undefined : codeContent;

	return {itemContent, literalContent};
}

const tokenizeLine = (line: string, lineNumber: number): ICodeToken[] => {

	const { indent, lineContent, whitespace } = extractLineContent(line); 
	const { endlineComment, codeContent } = extractEndlineComment(lineContent);
	const { itemContent, literalContent } = checkContentType(codeContent);

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
	parseFileContent(sourceCode);
	//tokenizeCode(sourceCode);
}