import { ISymbolPosition } from "../api/ISymbolPosition";
import { TokenType } from "./TokenType";

export interface IToken {
	type: TokenType;
	value?: string;
	start: ISymbolPosition;
	end: ISymbolPosition;
}