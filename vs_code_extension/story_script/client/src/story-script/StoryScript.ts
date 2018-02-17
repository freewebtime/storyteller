import { stsParser } from "./tokenizer/stsTokenizer";

export const compileStoryScript = (sourceCode: string) => {
	// return parseFileContent(sourceCode);
  // const parsed = stsParser.parseCode(sourceCode);
  // const tokenized = stsParser.tokenizeCode(sourceCode);
  const parsed = stsParser.parseCode(sourceCode);
  return parsed;
}