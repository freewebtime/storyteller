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
	SqBracketOpen = 'SqBracketOpen',
	SqBracketClose = 'SqBracketClose',
	Backslash = 'Backslash',
	Slash = 'Slash',

	Whitespace = 'Whitespace',
	Text = 'Text',
	Word = 'Word',
	Number = 'Number',
	Boolean = 'Boolean',

	Item = 'Item',
	ItemName = 'ItemName',
	ItemType = 'ItemType',
	
	ParamName = 'ParamName',
	ParamType = 'ParamType',

	Namespace = 'Namespace',
	NsMarkStart = 'NsMarkStart',
	NsMarkEnd = 'NsMarkEnd',

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

export interface INamespaceToken extends ICodeToken {
	openMark: ICodeToken;
	name: ICodeToken;
	closeMark: ICodeToken;	
}

export interface ITextToken extends ICodeToken {
	words: ICodeToken[];
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
