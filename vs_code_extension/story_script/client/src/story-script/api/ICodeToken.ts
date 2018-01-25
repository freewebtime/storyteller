import { IHash } from "../../shared/IHash";

export enum CodeTokenType {
	Comment = 'Comment',
	Item = 'Item',
	Literal = 'Literal',
	Reference = 'Reference',
	Expression = 'Expression',	
}

export interface ICodeToken {
	codeTokenType: CodeTokenType;
	content?: any;
	file?: string;
	startPos?: { line: number, symbol: number },
	endPos?: { line: number, symbol: number },
}

export interface ICommentToken extends ICodeToken {
}

export interface IReferenceToken extends ICodeToken {
}

export interface IItemToken extends ICodeToken {
	itemName: string;
	itemType?: IReferenceToken;
	value?: ICodeToken[];
}

export interface ILiteralToken extends ICodeToken {
	mentions?: IHash<ICodeToken>;
}

export interface IExpressionToken extends ICodeToken {
}
