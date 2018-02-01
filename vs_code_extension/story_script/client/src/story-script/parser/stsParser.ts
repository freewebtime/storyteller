import { ICodeToken, CodeTokenType, ITokenLiteral } from "../api/ICodeToken";
import { psUtils } from "./psUtils";
import { IParserState, IParseTokenResult } from "./IParserState";
import * as vscode from 'vscode';

export const parseStoryScript = (sourceCode: string) => {
	const parserState: IParserState = {
		sourceCode,
		tokens: [],
		cursor: {line: 0, symbol: 0},
		lines: sourceCode.split(/\r?\n/g),
	}	

	let state = parserState;

	while (!psUtils.isEndOfFile(state)) {
		const nextLine = parseNext(state);
		if (nextLine) {
			state = nextLine.state;
			state = psUtils.addToken(state, nextLine.token);
		}

		state = psUtils.setCursor(state, state.cursor.line + 1, 0);
	}

	return state;
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
