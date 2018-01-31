import { parseStoryScript } from "./parser/stsParser";

export const compileStoryScript = (sourceCode: string) => {
	// return parseFileContent(sourceCode);
	return parseStoryScript(sourceCode);
}