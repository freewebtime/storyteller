import { stsTokenizer } from "./parsing/stsTokenizer";
import { stsCompiler } from "./program/stsCompiler";
import { astParser } from "./astParsing/astParser";

export const compileStoryscriptModule = (sourceCode: string, filePath: string, fileName: string) => {
  const tokens = stsTokenizer.tokenizeCode(sourceCode);
  const parsed = astParser.parse(tokens);

  return parsed;
}
