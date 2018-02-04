import { stsTokenizer } from "./tokenizer/stsTokenizer";

export const compileStoryScript = (sourceCode: string) => {
	// return parseFileContent(sourceCode);
	return stsTokenizer.tokenizeCode(sourceCode);
}