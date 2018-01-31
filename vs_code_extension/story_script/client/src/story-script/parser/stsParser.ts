import { ICodeToken, CodeTokenType, ITokenItem, ITokenLiteral } from "../api/ICodeToken";
import { psUtils } from "./psUtils";
import { IParserState } from "./IParserState";
import { isNullOrUndefined } from "util";

export const parseStoryScript = (sourceCode: string) => {
	const parserState: IParserState = {
		sourceCode,
		tokens: [],
		cursor: {line: 0, symbol: 0},
		lines: sourceCode.split(/\r?\n/g),
	}	

	let state = parserState;

	const separator = psUtils.readSeparator(state);
	const untilSeparator = psUtils.readUtilSeparator(state);
	const endBlock = psUtils.readUntilMultiline(state, /\*\//)

	while (!psUtils.isEndOfFile(state)) {
		state = parseNext(state) || state;
	}

	return state;
}

const parseNext = (state: IParserState): IParserState => {
	if (psUtils.isEndOfFile(state)) {
		return undefined;
	}

	//endline
	if (psUtils.isEndOfLine(state)) {
		state = addEndlineToken(state) || state;
		state = psUtils.setCursor(state, state.cursor.line + 1, 0);		
		return state;
	}

	//comment block
	const cbResult = skipCommentBlock(state);
	if (cbResult) {
		return cbResult;
	}

	//comment line
	const clResult = skipCommentLine(state);
	if (clResult) {
		return clResult;
	}

	state = psUtils.setCursorAtLineEnd(state);
	return state;
}

const skipCommentBlock = (state: IParserState): IParserState => {
	const blockStartText = psUtils.readNext(state, /\/\*/);
	
	if (blockStartText) {
		const blockEndSearch = psUtils.findNextMultiline(state, /\*\//);
	
		if (!blockEndSearch) {
			//everything is comment until
			const endFilePos = psUtils.getEndFilePos(state);
			state = psUtils.setCursor(state, endFilePos.line, endFilePos.symbol);
			return state;
		}

		//we know where closing tag is
		state = psUtils.setCursor(state, blockEndSearch.position.line, blockEndSearch.position.symbol + blockEndSearch.searchResult.length);
		return state;
	}

	return undefined;
}

const skipCommentLine = (state: IParserState): IParserState => {
	const blockStartText = psUtils.readNext(state, /\/\//);

	if (blockStartText) {
		state = psUtils.setCursorAtLineEnd(state);
		return state;
	}

	return undefined;
}

const addEndlineToken = (state: IParserState): IParserState => {
	const endLinePos = psUtils.getEndLinePos(state);
	if (!endLinePos) {
		return undefined;
	}

	const token: ICodeToken = {
		type: CodeTokenType.Endline,
		position: endLinePos,
	}

	state = {
		...state,
		tokens: [
			...state.tokens,
			token,
		]
	};

	return state;
}
