import { stsParser } from "./tokenizer/stsTokenizer";

export const compileStoryScript = (sourceCode: string) => {
	// return parseFileContent(sourceCode);
  // const parsed = stsParser.parseCode(sourceCode);
  const parsed = stsParser.tokenizeCode(sourceCode);
  return parsed;
}