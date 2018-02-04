import { ICodeToken } from "../api/ICodeToken";
import { ISymbolPosition } from "../api/ISymbolPosition";

export interface IParserState {
	sourceCode: string;
	tokens: ICodeToken[];
	cursor: ISymbolPosition;
	lines: string[];
}

export interface IParseTokenResult {
	token: ICodeToken;
	state: IParserState;
}

export type IpsResult2 = IParserState | undefined;
export type IStsParser = (state: IParserState, line: number | undefined, symbol: number | undefined) => IParserState;
