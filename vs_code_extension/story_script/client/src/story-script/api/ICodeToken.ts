import { IHash } from "../../shared/IHash";

export enum CodeTokenType {
	Namespace = 'Namespace',
	Invalid = 'Invalid',
	Literal = 'Literal',
	Comment = 'Comment',
	Item = 'Item',
	NewLine = 'NewLine',
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

export interface ITokenItem extends ICodeToken {
	itemName: string;
	itemType: string;
	indent: number;
}
export interface ITokenLiteral extends ICodeToken {
	indent: number;
}
