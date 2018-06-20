import { stsTokenizer } from "./parsing/stsTokenizer";
import { stsParser } from "./parsing/stsParser";

export const compileStoryScript = (sourceCode: string) => {
  const tokenized = stsTokenizer.tokenizeCode(sourceCode);
  const parsed = stsParser.parse(tokenized);
  return parsed;
}

export const compileStoryscriptModule = (sourceCode: string, filePath: string, fileName: string) => {
  const parsed = stsParser.parseModule(sourceCode, fileName, filePath);
  return parsed;
}