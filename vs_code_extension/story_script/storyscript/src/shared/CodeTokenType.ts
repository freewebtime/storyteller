export enum CodeTokenType {
	// \r?\n
	Endline = 'Endline',
  // $
  Endfile = 'Endfile',
	// \s
	Space = 'Space',
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
  // "
  Quote = 'Quote',

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

	// everything else is Word
  Word = 'Word',
}