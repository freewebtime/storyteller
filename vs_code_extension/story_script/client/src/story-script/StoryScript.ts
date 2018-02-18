import { stsTokenizer } from "./parsing/stsTokenizer";
import { stsParser } from "./parsing/stsParser";

export const compileStoryScript = (sourceCode: string) => {
  const tokenized = stsTokenizer.tokenizeCode(sourceCode);
  const parsed = stsParser.parse(tokenized);
  return parsed;
}