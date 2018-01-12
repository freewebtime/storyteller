export enum CodeTokenType {
	Number = 'Number',
	String = 'String',
	Bool = 'Bool',
	Var = 'Var',
	Call = 'Call',
}

export interface ICodeToken {
	codeTokenType: CodeTokenType;
	file?: string;
	startPos?: { line: number, symbol: number },
	endPos?: { line: number, symbol: number },
}