import { stsTokenizer } from "./tokenizer/stsTokenizer";

export const compileStoryScript = (sourceCode: string) => {
  const tokenized = stsTokenizer.tokenizeCode(sourceCode);
  return tokenized;
}