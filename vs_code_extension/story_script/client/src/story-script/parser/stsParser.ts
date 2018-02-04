import { ICodeToken, ITokenLiteral } from "../api/ICodeToken";
import { psUtils } from "./psUtils";
import { IParserState, IParseTokenResult } from "./IParserState";
import * as vscode from 'vscode';
import { IHash } from "../../shared/IHash";
import { stsTokenizer } from "../tokenizer/stsTokenizer";

export const parseStoryScript = (sourceCode: string) => {

	return stsTokenizer.tokenizeCode(sourceCode);

	// return stsParser.parseSourceCode(sourceCode);
	
	// const parserState: IParserState = {
	// 	sourceCode,
	// 	tokens: [],
	// 	cursor: {line: 0, symbol: 0},
	// 	lines: sourceCode.split(/\r?\n/g),
	// }	

	// let state = parserState;

	// while (!psUtils.isEndOfFile(state)) {
	// 	const nextLine = parseNext(state);
	// 	if (nextLine) {
	// 		state = nextLine.state;
	// 		state = psUtils.addToken(state, nextLine.token);
	// 	}

	// 	state = psUtils.setCursor(state, state.cursor.line + 1, 0);
	// }

	// return state;
}

const parseNext = (state: IParserState): IParseTokenResult => {
	const nsResult = psUtils.parseNamespace(state);
	if (nsResult) {
		return nsResult;
	}

	const itemResult = psUtils.parseItem(state);
	if (itemResult) {
		return itemResult;
	}
	
	const literalResult = psUtils.parseLiteral(state);
	if (literalResult) {
		return literalResult;
	}

	return undefined;
}




const stsParser = {

	parseSourceCode: (sourceCode: string): IParserState => {
		let state: IParserState = {
			sourceCode,
			tokens: [],
			cursor: { line: 0, symbol: 0 },
			lines: sourceCode.split(/\r?\n/g),
		};

		return state;
	},

	parseNext: (state: IParserState): IParserState => {
		return state;
	},
}




