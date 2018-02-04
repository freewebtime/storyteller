export enum CodeTokenType {
	Comment = 'Comment',

	// \r?\n
	Endline = 'Endline',
	// \s
	Space = 'Space',
	// \s\s+
	Whitespace = 'Whitespace',
	// :
	Colon = 'Colon',
	// ;
	Semicolon = 'Semicolon',
	// .
	Dot = 'Dot',
	// ,
	Comma = 'Comma',
	// !
	NotSign = 'NotSign',
	// '
	Prime = 'Prime',
	// `
	Tilde = 'Tilde',
	// `
	OrSign = 'OrSign',
	// ?
	Question = 'Question',

	// *
	Star = 'Star',
	// -
	Minus = 'Minus',
	// +
	Plus = 'Plus',
	// =
	Equals = 'Equals',
	// ^
	Caret = 'Caret',
	// %
	Percent = 'Percent',
	// $
	Dollar = 'Dollar',
	// #
	Hash = 'Hash',
	// @
	AtSign = 'AtSign',
	// &
	Ampersand = 'Ampersand',

	// (
	ParenOpen = 'ParenOpen',
	// )
	ParenClose = 'ParenClose',
	// [
	BracketOpen = 'BracketOpen',
	// ]
	BracketClose = 'BracketClose',
	// {
	BraceOpen = 'BraceOpen',
	// }
	BraceClose = 'BraceClose',
	// <
	TupleOpen = 'TupleOpen',
	// >
	TupleClose = 'TupleClose',

	// /
	Slash = 'Slash',
	// \
	Backslash = 'Backslash',

	// //
	CommentLine = 'CommentLine',
	// /*
	CommentBlockOpen = 'CommentBlockOpen',
	// *\
	CommentBlockClose = 'CommentBlockClose',

	Array = 'Array',
	FuncType = 'FuncType',

	Text = 'Text',
	Word = 'Word',
	Number = 'Number',
	Boolean = 'Boolean',

	Item = 'Item',
	ItemMark = 'ItemMark',
	ItemName = 'ItemName',
	ItemType = 'ItemType',

	Param = 'Param',
	ParamName = 'ParamName',
	ParamType = 'ParamType',

	Namespace = 'Namespace',
	NsMarkStart = 'NsMarkStart',
	NsMarkEnd = 'NsMarkEnd',

	Literal = 'Literal',

	Mention = 'Mention',
	MentionMark = 'MentionMark',
	Call = 'Call',
	ParamValue = 'ParamValue'
}
