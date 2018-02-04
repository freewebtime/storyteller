import { CodeTokenType } from "./CodeTokenType";

export interface ITokenConfig {
	pattern: string;
	tokenType: CodeTokenType;
	subconfigs?: ITokenConfig[];
}



const allConfigs: ITokenConfig[] = [
	{
		pattern: '\\s+',
		tokenType: CodeTokenType.Whitespace,
	},
	{
		pattern: '-',
		tokenType: CodeTokenType.Whitespace,
	},
	{
		pattern: '-',
		tokenType: CodeTokenType.Whitespace,
	},
];

export const tokensConfig = {

}