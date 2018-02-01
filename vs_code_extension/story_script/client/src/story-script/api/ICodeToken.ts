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

	Array = 'Array',
	FuncType = 'FuncType',

	Whitespace = 'Whitespace',
	Text = 'Text',
	Word = 'Word',
	Number = 'Number',
	Boolean = 'Boolean',
	
	Item = 'Item',
	ItemMark = 'ItemMark',
	ItemName = 'ItemName',
	ItemType = 'ItemType',
	
	Param = 'Param',
	ParamName = 'ParamName',
	ParamType = 'ParamType',

	Namespace = 'Namespace',
	NsMarkStart = 'NsMarkStart',
	NsMarkEnd = 'NsMarkEnd',

	Literal = 'Literal',

	Mention = 'Mention',
	MentionMark = 'MentionMark',
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
	name: ICodeToken;
}

export interface ITextToken extends ICodeToken {
	words: ICodeToken[];
}

export interface IItemToken extends ICodeToken {
	indent: number;
	itemName: ICodeToken;
	itemType: ICodeToken;
}

export interface IArrayToken extends ICodeToken {
	arrayIndex: ICodeToken;
}

export interface IFuncTypeToken extends ICodeToken {
	params: ICodeToken[];
}

export interface ICallToken extends ICodeToken {
	params: ICodeToken[];
}

export interface IFuncParamToken extends ICodeToken {
	paramName: ICodeToken;
	paramType: ICodeToken;
}

export interface IMentionToken extends ITextToken {
}

export interface IItemTypeToken extends ITextToken {
}

export interface ITokenLiteral extends ICodeToken {
	whitespace: number;
}
