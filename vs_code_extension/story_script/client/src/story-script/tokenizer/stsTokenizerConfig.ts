import { CodeTokenType } from "../api/CodeTokenType";
import { IHash } from "../../shared/IHash";

export interface ITokenConfig {
	type: CodeTokenType;
	pattern: string;
}

const separators: ITokenConfig[] = [
  {
    type: CodeTokenType.Endline,
    pattern: '\\r?\\n',
  },
  // {
  //   type: CodeTokenType.Endfile,
  //   pattern: '$',
  // },
	{
		type: CodeTokenType.Whitespace,
		pattern: '\\s\\s+',
	},
	{
		type: CodeTokenType.Space,
		pattern: '\\s',
	},
	{
		type: CodeTokenType.Colon,
		pattern: '\\:',
	},
	{
		type: CodeTokenType.Semicolon,
		pattern: '\\;',
	},
	{
		type: CodeTokenType.Dot,
		pattern: '\\.',
	},
	{
		type: CodeTokenType.Comma,
		pattern: '\\,',
	},
	{
		type: CodeTokenType.NotSign,
		pattern: '\\!',
	},
	{
		type: CodeTokenType.Prime,
		pattern: '\\\'',
	},
	{
		type: CodeTokenType.Tilde,
		pattern: '\\`',
	},
	{
		type: CodeTokenType.OrSign,
		pattern: '\\|',
	},
	{
		type: CodeTokenType.Question,
		pattern: '\\?',
	},

	{
		type: CodeTokenType.Star,
		pattern: '\\*',
	},
	{
		type: CodeTokenType.Minus,
		pattern: '\\-',
	},
	{
		type: CodeTokenType.Plus,
		pattern: '\\+',
	},
	{
		type: CodeTokenType.Equals,
		pattern: '\\=',
	},
	{
		type: CodeTokenType.Caret,
		pattern: '\\^',
	},
	{
		type: CodeTokenType.Percent,
		pattern: '\\%',
	},
	{
		type: CodeTokenType.Dollar,
		pattern: '\\$',
	},
	{
		type: CodeTokenType.Hash,
		pattern: '\\#',
	},
	{
		type: CodeTokenType.AtSign,
		pattern: '\\@',
	},
	{
		type: CodeTokenType.Ampersand,
		pattern: '\\&',
	},
	{
		type: CodeTokenType.NumSign,
		pattern: '\\№',
	},

	{
		type: CodeTokenType.ParenOpen,
		pattern: '\\(',
	},
	{
		type: CodeTokenType.ParenClose,
		pattern: '\\)',
	},
	{
		type: CodeTokenType.BracketOpen,
		pattern: '\\[',
	},
	{
		type: CodeTokenType.BracketClose,
		pattern: '\\]',
	},
	{
		type: CodeTokenType.BraceOpen,
		pattern: '\\{',
	},
	{
		type: CodeTokenType.BraceClose,
		pattern: '\\}',
	},
	{
		type: CodeTokenType.TupleOpen,
		pattern: '\\<',
	},
  {
    type: CodeTokenType.TupleClose,
    pattern: '\\>',
  },
  {
    type: CodeTokenType.Quote,
    pattern: '\\\"',
  },

	{
		type: CodeTokenType.CommentLine,
		pattern: '\\/\\/',
	},
	{
		type: CodeTokenType.CommentBlockOpen,
		pattern: '\\/\\*',
	},
	{
		type: CodeTokenType.CommentBlockClose,
		pattern: '\\*\\/',
	},

	{
		type: CodeTokenType.Slash,
		pattern: '\\/',
	},
	{
		type: CodeTokenType.Backslash,
		pattern: '\\\\',
	},
];

const tokens: ITokenConfig[] = [
	...separators,
];

const sortTokenConfigs = (configs: ITokenConfig[]): IHash<ITokenConfig> => {
	const result = configs.reduce((prev: IHash<ITokenConfig>, curr: ITokenConfig, index: number, array: ITokenConfig[]) => {
		return {
			...prev,
			[curr.type]: curr,
		};
	}, {});

	return result;
}

const sortedSeparators = sortTokenConfigs(separators);
const sortedTokens = sortTokenConfigs(tokens);

const combinePatterns = (patterns: string[], separator: string = '|', isGroup: boolean = true) => {
	const result = patterns.reduce((prev: string, curr: string, index: number, array: string[]) => {
		const pattern = isGroup ? `(${curr})` : `(?:${curr})`;
		const result = index === 0 ? pattern : `${prev}|${pattern}`;
		return result;
	}, '');

	return result;
}
const wrapPatternWithCursorPos = (pattern: string, cursorPos: number) => {
  return `(?:.|\\r|\\n){${cursorPos}}(?:${pattern})`
}

const allSeparatorsPattern = combinePatterns(separators.map((token) => { return token.pattern }));
const allSeparatorsRegexp = new RegExp(allSeparatorsPattern);

const allTokensPattern = combinePatterns(tokens.map((token) => { return token.pattern }));
const allTokensRegexp = new RegExp(allTokensPattern);

export const stsParserConfig = {
	separators,
	tokens,

	sortedSeparators,
	sortedTokens,

	allSeparatorsPattern,
	allSeparatorsRegexp,

	allTokensPattern,
	allTokensRegexp,

  combinePatterns,
  wrapPatternWithCursorPos,
}