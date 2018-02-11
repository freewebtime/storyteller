import { TokenType } from "../api/TokenType";
import { IHash } from "../../shared/IHash";

export interface ITokenConfig {
	type: TokenType;
	pattern: string;
}

const separators: ITokenConfig[] = [
	{
		type: TokenType.Endline,
		pattern: '\\r?\\n',
	},
	{
		type: TokenType.Whitespace,
		pattern: '\\s\\s+',
	},
	{
		type: TokenType.Space,
		pattern: '\\s',
	},
	{
		type: TokenType.Colon,
		pattern: '\\:',
	},
	{
		type: TokenType.Semicolon,
		pattern: '\\;',
	},
	{
		type: TokenType.Dot,
		pattern: '\\.',
	},
	{
		type: TokenType.Comma,
		pattern: '\\,',
	},
	{
		type: TokenType.NotSign,
		pattern: '\\!',
	},
	{
		type: TokenType.Prime,
		pattern: '\\\'',
	},
	{
		type: TokenType.Tilde,
		pattern: '\\`',
	},
	{
		type: TokenType.OrSign,
		pattern: '\\|',
	},
	{
		type: TokenType.Question,
		pattern: '\\?',
	},

	{
		type: TokenType.Star,
		pattern: '\\*',
	},
	{
		type: TokenType.Minus,
		pattern: '\\-',
	},
	{
		type: TokenType.Plus,
		pattern: '\\+',
	},
	{
		type: TokenType.Equals,
		pattern: '\\=',
	},
	{
		type: TokenType.Caret,
		pattern: '\\^',
	},
	{
		type: TokenType.Percent,
		pattern: '\\%',
	},
	{
		type: TokenType.Dollar,
		pattern: '\\$',
	},
	{
		type: TokenType.Hash,
		pattern: '\\#',
	},
	{
		type: TokenType.AtSign,
		pattern: '\\@',
	},
	{
		type: TokenType.Ampersand,
		pattern: '\\&',
	},
	{
		type: TokenType.NumSign,
		pattern: '\\№',
	},

	{
		type: TokenType.ParenOpen,
		pattern: '\\(',
	},
	{
		type: TokenType.ParenClose,
		pattern: '\\)',
	},
	{
		type: TokenType.BracketOpen,
		pattern: '\\[',
	},
	{
		type: TokenType.BracketClose,
		pattern: '\\]',
	},
	{
		type: TokenType.BraceOpen,
		pattern: '\\{',
	},
	{
		type: TokenType.BraceClose,
		pattern: '\\}',
	},
	{
		type: TokenType.TupleOpen,
		pattern: '\\<',
	},
	{
		type: TokenType.TupleClose,
		pattern: '\\>',
	},

	{
		type: TokenType.CommentLine,
		pattern: '\\/\\/',
	},
	{
		type: TokenType.CommentBlockOpen,
		pattern: '\\/\\*',
	},
	{
		type: TokenType.CommentBlockClose,
		pattern: '\\*\\/',
	},

	{
		type: TokenType.Slash,
		pattern: '\\/',
	},
	{
		type: TokenType.Backslash,
		pattern: '\\\\',
	},
];

const tokens: ITokenConfig[] = [
	{
		type: TokenType.ItemMark,
		pattern: '\\*\\s',
	},
	{
		type: TokenType.ItemTypeMark,
		pattern: '\\:\\s',
	},

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

const allSeparatorsPattern = combinePatterns(separators.map((token) => { return token.pattern }));
const allSeparatorsRegexp = new RegExp(allSeparatorsPattern);

const allTokensPattern = combinePatterns(tokens.map((token) => { return token.pattern }));
const allTokensRegexp = new RegExp(allTokensPattern);

export const tokenizerConfig = {
	separators,
	tokens,

	sortedSeparators,
	sortedTokens,

	allSeparatorsPattern,
	allSeparatorsRegexp,

	allTokensPattern,
	allTokensRegexp,

	combinePatterns,
}