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

export interface IItemToken extends ICodeToken {
	whitespace: ICodeToken;
	itemMark: ICodeToken;
	itemName: ICodeToken;
	itemType: ICodeToken;
}

export interface IArrayToken extends ICodeToken {
	openBracket: ICodeToken;
	arrayIndex: ICodeToken;
	closeBracket: ICodeToken;	
}

export interface IFuncTypeToken extends ICodeToken {
	openParen: ICodeToken;
	params: ICodeToken[];
	closeParen: ICodeToken;
}

export interface IFuncParamToken extends ICodeToken {
	paramName: ICodeToken;
	paramType: ICodeToken;
}

export interface IItemTypeToken extends ITextToken {
}

export interface ITokenLiteral extends ICodeToken {
	whitespace: number;
}
