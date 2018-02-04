import { IHash } from "../../shared/IHash";
import { CodeTokenType } from "../parser/CodeTokenType";
import { ISymbolPosition } from "./ISymbolPosition";

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
