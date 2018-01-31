import { ICodeToken, ISymbolPosition } from "../api/ICodeToken";

export interface IParserState {
	sourceCode: string;
	tokens: ICodeToken[];
	cursor: ISymbolPosition;
	lines: string[];
}

export type IpsResult2 = IParserState | undefined;
export type IStsParser = (state: IParserState, line: number | undefined, symbol: number | undefined) => IParserState;
