export enum TokenType {
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
	// |
	OrSign = 'OrSign',
	// ?
	Question = 'Question',
	// №
	NumSign = 'NumSign',

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
	// */
	CommentBlockClose = 'CommentBlockClose',

	// *\s
	ItemMark = 'ItemMark',
	// :\s
	ItemTypeMark = 'ItemTypeMark',

	// everything else is Word
  Word = 'Word',

  
}