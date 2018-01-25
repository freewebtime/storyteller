import { ICodeToken, IItemToken, CodeTokenType } from "../api/ICodeToken";

export enum CodeLineType {
	Unknown = 'Unknown',
	Empty = 'Empty',
	Comment = 'Comment',
	Item = 'Item',
	Literal = 'Literal',
}

export interface ICodeLine {
	index: number;
	indent: number;
	codeLineType: CodeLineType;
	content?: string;
	whitespace?: string;
}

export interface ISourceCode {
	sourceLines: string[];
	codeTokens: ICodeToken[];
	tokensGraph: ICodeToken[];
}

export const parseFileContent = (fileContent: string): ICodeToken => {

	const rootToken: IItemToken = {
		codeTokenType: CodeTokenType.Item,
		itemName: 'fileRoot',
		content: fileContent,
	}

	const result = parseTokenContent(rootToken);
	return result;
}

export const parseTokenContent = (token: ICodeToken): ICodeToken => {
	
	
	return token;
}

const parseLine = (sourceCode: ISourceCode, index: number) => {
	if (!sourceCode || sourceCode.sourceLines.length <= index) {
		return sourceCode;
	}

	const line = sourceCode.sourceLines[index];

	
	return sourceCode;
}

const extractLineContent = (line: string = '') => {
	const match = line.match(/^(?:((?: {2})+)|(\t)+)?(.*)/);
	const whitespace = match[1] || match[2];
	const indent = match[1]
		? (match[1].length / 2)
		: (match[2] ? match[2].length : 0)
	const lineContent = match[3];

	return { indent, lineContent, whitespace };
}

const extractEndlineComment = (lineContent: string = '') => {
	const match1 = lineContent.match(/([^\/{2}]+)?(.*)?/);
	const codeContent = match1[1];
	const endlineComment = match1[2];

	return { codeContent, endlineComment };
}

const checkContentType = (codeContent: string = '') => {
	const match = codeContent.match(/\s*(\* [\w.]+:)(.*)/);
	const itemContent = match ? match[1] : undefined;
	const literalContent = match ? undefined : codeContent;

	return { itemContent, literalContent };
}