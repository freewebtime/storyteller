import { stsTokenizer } from "./parsing/stsTokenizer";
import { stsParser } from "./parsing/stsParser";
import { stsCompiler } from "./program/stsCompiler";
import { astParser } from "./astParsing/astParser";

export const compileStoryScript = (sourceCode: string) => {
  const tokenized = stsTokenizer.tokenizeCode(sourceCode);
  const parsed = stsParser.parse(tokenized);
  return parsed;
}

export const compileStoryscriptModule = (sourceCode: string, filePath: string, fileName: string) => {
  // const parsed = stsParser.parseModule(sourceCode, fileName, filePath);
  // const compiled = stsCompiler.compileSts([parsed]);
  // return {parsed, compiled};

  const tokens = stsTokenizer.tokenizeCode(sourceCode);
  const parsed = astParser.parse(tokens);

  return parsed;
}
