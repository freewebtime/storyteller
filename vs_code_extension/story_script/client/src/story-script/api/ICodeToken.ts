import { IHash } from "../../shared/IHash";

export enum CodeTokenType {
	Namespace = 'Namespace',
	Literal = 'Literal',
	Comment = 'Comment',
	ItemMark = 'ItemMark',
	Special = 'Colon',
}

export interface ICodeToken {
	codeTokenType: CodeTokenType;
	value?: any;
	position?: {
		line: number;
		symbol: number;
		length: number;
	}
}
