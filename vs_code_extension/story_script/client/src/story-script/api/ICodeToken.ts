import { IHash } from "../../shared/IHash";

export enum CodeTokenType {
	Comment = 'Comment',

	Endline = 'Endline',
	Space = 'Space',
	Colon = 'Colon',
	Dot = 'Dot',
	Comma = 'Comma',
	Star = 'Star',
	ParenOpen = 'ParenOpen',
	ParenClose = 'ParenClose',
	Backslash = 'Backslash',
	Slash = 'Slash',

	Text = 'Text',
	Number = 'Number',
	Boolean = 'Boolean',

	Item = 'Item',
	ItemName = 'ItemName',
	ItemType = 'ItemType',
	ItemTypeFunc = 'ItemTypeFunc',
	ItemTypeStruct = 'ItemTypeStruct',

	Namespace = 'Namespace',

	Literal = 'Literal',

	Mention = 'Mention',
	Call = 'Call',
	ParamValue = 'ParamValue'
}

export interface ISymbolPosition {
	line: number;
	symbol: number;
}

export interface ICodeToken {
	type: CodeTokenType;
	value?: string;
	position?: ISymbolPosition;
}

export interface ITokenItem extends ICodeToken {
	whitespace: number;
	itemMark: ICodeToken;
	itemName: ICodeToken;
	itemType: string;
}

export interface ITokenLiteral extends ICodeToken {
	whitespace: number;
}
