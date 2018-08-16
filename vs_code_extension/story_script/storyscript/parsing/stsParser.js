"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CodeTokenType_1 = require("../shared/CodeTokenType");
const astFactory_1 = require("./astFactory");
const Operators_1 = require("../shared/Operators");
exports.stsParser = {
    parseModule: (tokens, moduleName) => {
        let state = {
            tokens: tokens,
            cursor: 0,
        };
        let errors = [];
        let subitems = [];
        while (!exports.stsParser.isEndOfFile(state)) {
            let subitemResult = exports.stsParser.parseSubitem(state, 0);
            if (subitemResult) {
                state = subitemResult.state;
                let subitem = subitemResult.result;
                subitems = exports.stsParser.addItemToArray(subitems, subitem);
                continue;
            }
            state = exports.stsParser.skipTokens(state, 1);
        }
        let start = { line: 0, symbol: 0 };
        let end = { line: 0, symbol: 0 };
        if (subitems.length > 0) {
            end = subitems[subitems.length - 1].end;
        }
        const body = astFactory_1.astFactory.createArray(subitems, start, end);
        const result = astFactory_1.astFactory.createModule(body, moduleName, start, end);
        return {
            errors,
            result
        };
    },
    parseImport: (state, targetIndent) => {
        if (exports.stsParser.isEndOfFile(state)) {
            return undefined;
        }
        // check whitespace
        let checkIndent = exports.stsParser.checkIndent(state, targetIndent);
        if (!checkIndent) {
            return undefined;
        }
        state = checkIndent.state;
        // read import mark *+
        const markSequence = [CodeTokenType_1.CodeTokenType.Star, CodeTokenType_1.CodeTokenType.Plus, CodeTokenType_1.CodeTokenType.Space];
        if (!exports.stsParser.checkTokenSequence(state, markSequence)) {
            return undefined;
        }
        let start = exports.stsParser.getCursorPosition(state);
        let end = Object.assign({}, start, { symbol: start.symbol + markSequence.length });
        state = exports.stsParser.skipTokens(state, markSequence.length);
        // read import name until '=' sign or end of line
        let name;
        let nameResult = exports.stsParser.readString(state, [CodeTokenType_1.CodeTokenType.Endline, CodeTokenType_1.CodeTokenType.Equals], true);
        if (nameResult) {
            state = nameResult.state;
            name = nameResult.result;
            end = name.end || end;
        }
        // if found '=' sign, then parse everything as path until end of line
        let path;
        let nextToken = exports.stsParser.getToken(state);
        if (nextToken && nextToken.type === CodeTokenType_1.CodeTokenType.Equals) {
            state = exports.stsParser.skipTokens(state, 1);
            // we've skipped = sign
            const pathResult = exports.stsParser.readString(state, [CodeTokenType_1.CodeTokenType.Endline], true);
            if (pathResult) {
                path = pathResult.result;
                end = path.end || end;
                state = pathResult.state;
            }
        }
        // skip endline if any
        if (exports.stsParser.getTokenOfType(state, [CodeTokenType_1.CodeTokenType.Endline])) {
            state = exports.stsParser.skipTokens(state, 1);
        }
        if (exports.stsParser.getTokenOfType(state, [CodeTokenType_1.CodeTokenType.Endline])) {
            state = exports.stsParser.skipTokens(state, 1);
        }
        const result = astFactory_1.astFactory.createImport(name, path, targetIndent, start, end);
        return {
            state,
            result,
        };
    },
    parseVariable: (state, targetIndent) => {
        if (exports.stsParser.isEndOfFile(state)) {
            return undefined;
        }
        // check indent
        let checkIndent = exports.stsParser.checkIndent(state, targetIndent);
        if (!checkIndent) {
            return undefined;
        }
        state = checkIndent.state;
        // read item mark * 
        const markSequence = [CodeTokenType_1.CodeTokenType.Star, CodeTokenType_1.CodeTokenType.Space];
        if (!exports.stsParser.checkTokenSequence(state, markSequence)) {
            return undefined;
        }
        let start = exports.stsParser.getCursorPosition(state);
        let end = Object.assign({}, start, { symbol: start.symbol + markSequence.length });
        state = exports.stsParser.skipTokens(state, markSequence.length);
        // read item name name until : or end of line
        let name;
        let nameResult = exports.stsParser.readString(state, [CodeTokenType_1.CodeTokenType.Endline, CodeTokenType_1.CodeTokenType.Colon], true);
        if (nameResult) {
            state = nameResult.state;
            name = nameResult.result;
            start = name.start || start;
            end = name.end || end;
        }
        // read var type
        let varType;
        // check if we stopped on colon
        if (exports.stsParser.checkTokenSequence(state, [CodeTokenType_1.CodeTokenType.Colon])) {
            state = exports.stsParser.skipTokens(state, 1);
            end = exports.stsParser.getCursorPosition(state);
            // read type
            let varTypeResult = exports.stsParser.readString(state, [CodeTokenType_1.CodeTokenType.Endline], true);
            if (varTypeResult) {
                varType = varTypeResult.result;
                state = varTypeResult.state;
                end = varType.end || end;
            }
        }
        // check variable value
        let varValue;
        // skip endline
        if (exports.stsParser.getTokenOfType(state, [CodeTokenType_1.CodeTokenType.Endline])) {
            state = exports.stsParser.skipTokens(state, 1);
            // find all subitems
            let parseSubitemResult;
            let varValueLines;
            let varValueStart = exports.stsParser.getCursorPosition(state);
            while (parseSubitemResult = exports.stsParser.parseSubitem(state, targetIndent + 1)) {
                let subitem = parseSubitemResult.result;
                state = parseSubitemResult.state;
                end = subitem.end || end;
                varValueLines = varValueLines || [];
                varValueLines = exports.stsParser.addItemToArray(varValueLines, subitem);
                if (exports.stsParser.getTokenOfType(state, [CodeTokenType_1.CodeTokenType.Endline])) {
                    state = exports.stsParser.skipTokens(state, 1);
                }
            }
            if (varValueLines) {
                varValue = astFactory_1.astFactory.createArray(varValueLines, varValueStart, end);
            }
        }
        let result = astFactory_1.astFactory.createVariable(name, varType, varValue, targetIndent, start, end);
        return {
            state,
            result,
        };
    },
    parseAddText: (state, targetIndent) => {
        if (exports.stsParser.isEndOfFile(state)) {
            return undefined;
        }
        // check indent
        let checkIndent = exports.stsParser.checkIndent(state, targetIndent);
        if (!checkIndent) {
            return undefined;
        }
        state = checkIndent.state;
        let start = exports.stsParser.getCursorPosition(state);
        let end = Object.assign({}, start);
        let template;
        let templateResult = exports.stsParser.parseTemplate(state);
        if (templateResult) {
            template = templateResult.result;
            state = templateResult.state;
            end = exports.stsParser.getCursorPosition(state);
            let result = astFactory_1.astFactory.createAddText(template, targetIndent, start, end);
            return {
                result,
                state
            };
        }
        if (exports.stsParser.getTokenOfType(state, [CodeTokenType_1.CodeTokenType.Endline])) {
            end = Object.assign({}, start, { symbol: start.symbol + 1 });
            let templateString = astFactory_1.astFactory.createString('\\n', start, end);
            let template = astFactory_1.astFactory.createTemplate([templateString], start, end);
            let result = astFactory_1.astFactory.createAddText(template, targetIndent, start, end);
            state = exports.stsParser.skipTokens(state, 1);
            return {
                result,
                state
            };
        }
        return undefined;
    },
    parseSubitem: (state, targetIndent) => {
        if (exports.stsParser.isEndOfFile(state)) {
            return undefined;
        }
        const importResult = exports.stsParser.parseImport(state, targetIndent);
        if (importResult) {
            return importResult;
        }
        const variableResult = exports.stsParser.parseVariable(state, targetIndent);
        if (variableResult) {
            return variableResult;
        }
        const addTextResult = exports.stsParser.parseAddText(state, targetIndent);
        if (addTextResult) {
            return addTextResult;
        }
        return undefined;
    },
    parseTemplate: (state) => {
        if (exports.stsParser.isEndOfFile(state)) {
            return undefined;
        }
        let items;
        let start = exports.stsParser.getCursorPosition(state);
        let end = Object.assign({}, start);
        let itemResult;
        while (itemResult = exports.stsParser.parseTemplateItem(state)) {
            state = itemResult.state;
            let item = itemResult.result;
            items = exports.stsParser.addItemToArray(items || [], item);
            end = item.end || end;
            if (exports.stsParser.getTokenOfType(state, [CodeTokenType_1.CodeTokenType.Endline])) {
                break;
            }
        }
        if (!items) {
            return undefined;
        }
        const result = astFactory_1.astFactory.createTemplate(items, start, end);
        return {
            state,
            result
        };
    },
    parseTemplateItem: (state) => {
        if (exports.stsParser.isEndOfFile(state)) {
            return undefined;
        }
        const mentionResult = exports.stsParser.parseMention(state);
        if (mentionResult) {
            return mentionResult;
        }
        const textResult = exports.stsParser.parseTemplateText(state);
        if (textResult) {
            return textResult;
        }
        return undefined;
    },
    parseTemplateText: (state) => {
        if (exports.stsParser.isEndOfFile(state)) {
            return undefined;
        }
        // read everything until star or endline
        let textResult = exports.stsParser.readString(state, [CodeTokenType_1.CodeTokenType.Star, CodeTokenType_1.CodeTokenType.Endline]);
        if (textResult) {
            return textResult;
        }
        return undefined;
    },
    parseMention: (state) => {
        if (exports.stsParser.isEndOfFile(state)) {
            return undefined;
        }
        // check star symbol
        let starToken = exports.stsParser.getTokenOfType(state, [CodeTokenType_1.CodeTokenType.Star]);
        if (!starToken) {
            return undefined;
        }
        state = exports.stsParser.skipTokens(state, 1);
        let start = starToken.start;
        let result;
        // parse identifier
        let identifierResult = exports.stsParser.parseIdentifier(state);
        if (identifierResult) {
            state = identifierResult.state;
            let identifier = identifierResult.result;
            let end = identifier.end;
            result = astFactory_1.astFactory.createMention(identifier, start, end);
            if (exports.stsParser.getTokenOfType(state, [CodeTokenType_1.CodeTokenType.Semicolon])) {
                state = exports.stsParser.skipTokens(state, 1);
            }
            return {
                state,
                result
            };
        }
        return undefined;
    },
    parseIdentifier: (state) => {
        if (exports.stsParser.isEndOfFile(state)) {
            return undefined;
        }
        let items;
        let start = exports.stsParser.getCursorPosition(state);
        let end = Object.assign({}, start);
        let itemResult;
        while (itemResult = exports.stsParser.parseIdentifierItem(state)) {
            state = itemResult.state;
            let item = itemResult.result;
            items = exports.stsParser.addItemToArray(items || [], item);
            end = item.end || end;
            if (!exports.stsParser.getTokenOfType(state, [CodeTokenType_1.CodeTokenType.Dot, CodeTokenType_1.CodeTokenType.ParenOpen])) {
                break;
            }
            if (exports.stsParser.getTokenOfType(state, [CodeTokenType_1.CodeTokenType.Dot])) {
                state = exports.stsParser.skipTokens(state, 1);
            }
        }
        if (!items) {
            return undefined;
        }
        const name = astFactory_1.astFactory.createArray(items, start, end);
        const result = astFactory_1.astFactory.createIdentifier(name, name.start, name.end);
        return {
            state,
            result
        };
    },
    parseIdentifierItem: (state) => {
        var wordResult = exports.stsParser.parseWord(state);
        if (wordResult) {
            return wordResult;
        }
        var callResult = exports.stsParser.parseCall(state);
        if (callResult) {
            return callResult;
        }
        return undefined;
    },
    parseCall: (state) => {
        if (exports.stsParser.isEndOfFile(state)) {
            return undefined;
        }
        // skip (
        if (!exports.stsParser.getTokenOfType(state, [CodeTokenType_1.CodeTokenType.ParenOpen])) {
            return undefined;
        }
        let start = exports.stsParser.getCursorPosition(state);
        state = exports.stsParser.skipTokens(state, 1);
        state = exports.stsParser.skipWhitespace(state, true);
        // read everything as identifiers until )
        let params = [];
        while (!exports.stsParser.getTokenOfType(state, [CodeTokenType_1.CodeTokenType.ParenClose])) {
            // check identifier
            let identifierResult = exports.stsParser.parseIdentifier(state);
            if (identifierResult) {
                let identifier = identifierResult.result;
                state = identifierResult.state;
                state = exports.stsParser.skipWhitespace(state, true);
                params = [
                    ...params,
                    identifier
                ];
                continue;
            }
            // if we here, skip symbol
            state = exports.stsParser.skipTokens(state, 1);
        }
        if (exports.stsParser.getTokenOfType(state, [CodeTokenType_1.CodeTokenType.ParenClose])) {
            state = exports.stsParser.skipTokens(state, 1);
        }
        let end = exports.stsParser.getCursorPosition(state);
        let result = astFactory_1.astFactory.createCall(params, start, end);
        return {
            state,
            result
        };
    },
    parseWord: (state) => {
        if (exports.stsParser.isEndOfFile(state)) {
            return undefined;
        }
        let token = exports.stsParser.getTokenOfType(state, [CodeTokenType_1.CodeTokenType.Word]);
        if (!token) {
            return undefined;
        }
        let result = astFactory_1.astFactory.createString(token.value, token.start, token.end);
        state = exports.stsParser.skipTokens(state, 1);
        return {
            state,
            result
        };
    },
    parseTextLine: (state, targetIndent) => {
        if (exports.stsParser.isEndOfFile(state)) {
            return undefined;
        }
        let checkIndent = exports.stsParser.checkIndent(state, targetIndent);
        if (!checkIndent) {
            return undefined;
        }
        state = checkIndent.state;
        let lineResult = exports.stsParser.readString(state, [CodeTokenType_1.CodeTokenType.Endline]);
        return lineResult;
    },
    readString: (state, breakTokens, trimString = false) => {
        if (exports.stsParser.isEndOfFile(state)) {
            return undefined;
        }
        let result;
        let startPos;
        let endPos;
        let nextToken;
        let offset = 0;
        while (nextToken = exports.stsParser.getToken(state, offset)) {
            if (!nextToken) {
                break;
            }
            if (breakTokens.indexOf(nextToken.type) >= 0) {
                break;
            }
            if (!result) {
                // first token
                startPos = nextToken.start;
                endPos = nextToken.end;
                result = nextToken.value;
            }
            else {
                result = result + nextToken.value;
                endPos = nextToken.end;
            }
            offset++;
        }
        if (!result) {
            return undefined;
        }
        state = exports.stsParser.skipTokens(state, offset);
        if (trimString) {
            result = result.trim();
        }
        if (!result) {
            return undefined;
        }
        const resultNode = astFactory_1.astFactory.createString(result, startPos, endPos);
        return {
            result: resultNode,
            state
        };
    },
    parseOperator: (state, multiline, skipSpace) => {
        if (exports.stsParser.isEndOfFile(state)) {
            return undefined;
        }
        if (skipSpace) {
            state = exports.stsParser.skipWhitespace(state, multiline);
        }
        // operation mark may be . + - / * > < =
        let token = exports.stsParser.getToken(state);
        if (!token) {
            return undefined;
        }
        for (let key in Operators_1.Operators) {
            const operator = Operators_1.Operators[key];
            if (token.value === operator) {
                state = exports.stsParser.skipTokens(state, 1);
                return {
                    state,
                    result: operator,
                };
            }
        }
        return undefined;
    },
    skipTokens: (state, tokensCount) => {
        if (exports.stsParser.isEndOfFile(state)) {
            if (tokensCount === 0)
                return state;
            return undefined;
        }
        const cursor = state.cursor + tokensCount;
        if (state.tokens.length < cursor) {
            return undefined;
        }
        state = Object.assign({}, state, { cursor: cursor });
        return state;
    },
    // single line!
    readWhitespace: (state) => {
        return exports.stsParser.readTokensAsString(state, [CodeTokenType_1.CodeTokenType.Space]);
    },
    readTokensAsString: (state, tokenTypes) => {
        let start;
        let end;
        let value;
        let nextToken;
        while (nextToken = exports.stsParser.getTokenOfType(state, tokenTypes)) {
            if (!value) {
                start = nextToken.start;
                end = nextToken.end;
                value = nextToken.value;
            }
            else {
                end = nextToken.end;
                value = value + nextToken.value;
            }
            state = exports.stsParser.skipTokens(state, 1);
        }
        if (value) {
            const result = astFactory_1.astFactory.createString(value, start, end);
            return {
                state,
                result,
            };
        }
        return undefined;
    },
    skipWhitespace: (state, multiline = false) => {
        const tokenTypes = multiline
            ? [CodeTokenType_1.CodeTokenType.Space, CodeTokenType_1.CodeTokenType.Endline]
            : [CodeTokenType_1.CodeTokenType.Space];
        return exports.stsParser.skipTokensOfType(state, tokenTypes);
    },
    skipTokenOfType: (state, tokenTypes) => {
        let nextToken = exports.stsParser.getTokenOfType(state, tokenTypes);
        if (nextToken) {
            state = exports.stsParser.skipTokens(state, 1);
        }
        return state;
    },
    skipTokensOfType: (state, tokenTypes) => {
        if (exports.stsParser.isEndOfFile(state)) {
            return state;
        }
        if (!tokenTypes || tokenTypes.length <= 0) {
            return state;
        }
        let nextToken;
        while (nextToken = exports.stsParser.getToken(state)) {
            if (tokenTypes.indexOf(nextToken.type) < 0) {
                return state;
            }
            state = exports.stsParser.skipTokens(state, 1);
        }
        return state;
    },
    skipUntil: (state, tokenTypes) => {
        if (exports.stsParser.isEndOfFile(state)) {
            return state;
        }
        if (!tokenTypes || tokenTypes.length <= 0) {
            return state;
        }
        let nextToken;
        while (nextToken = exports.stsParser.getToken(state)) {
            if (tokenTypes.indexOf(nextToken.type) >= 0) {
                return state;
            }
            state = exports.stsParser.skipTokens(state, 1);
        }
        return state;
    },
    checkIndent: (state, targetIndent) => {
        // check indent
        let whitespace;
        let indent = 0;
        const whitespaceResult = exports.stsParser.readWhitespace(state);
        if (whitespaceResult) {
            state = whitespaceResult.state;
            whitespace = whitespaceResult.result;
            indent = whitespace.value.length / 2;
        }
        if (indent != targetIndent) {
            return undefined;
        }
        return {
            state,
            result: whitespace
        };
    },
    checkTokenSequence: (state, tokenTypes) => {
        if (exports.stsParser.isEndOfFile(state)) {
            return false;
        }
        if (!tokenTypes || tokenTypes.length <= 0) {
            return true;
        }
        for (let i = 0; i < tokenTypes.length; i++) {
            const tokenType = tokenTypes[i];
            const token = exports.stsParser.getToken(state, i);
            if (!token || token.type !== tokenType) {
                // broken sequence
                return undefined;
            }
        }
        return true;
    },
    getToken: (state, offset = 0) => {
        if (exports.stsParser.isEndOfFile(state, offset)) {
            return undefined;
        }
        const cursor = state.cursor + offset;
        if (cursor < 0) {
            return undefined;
        }
        return state.tokens[cursor];
    },
    getTokenOfType: (state, types, offset = 0) => {
        if (exports.stsParser.isEndOfFile(state, offset)) {
            return undefined;
        }
        const cursor = state.cursor + offset;
        if (cursor < 0) {
            return undefined;
        }
        const token = state.tokens[cursor];
        if (!token) {
            return undefined;
        }
        if (types.indexOf(token.type) < 0) {
            return undefined;
        }
        return token;
    },
    getCursorPosition: (state) => {
        if (!state) {
            return undefined;
        }
        if (exports.stsParser.isEndOfFile(state)) {
            if (state.tokens.length > 0) {
                let lastToken = state.tokens[state.tokens.length - 1];
                return lastToken.start;
            }
        }
        const nextToken = exports.stsParser.getToken(state);
        return nextToken.start;
    },
    isEndOfFile: (state, offset = 0) => {
        if (!state || !state.tokens || state.tokens.length <= 0) {
            return true;
        }
        const cursor = state.cursor + offset;
        return state.tokens.length <= cursor;
    },
    addParsingError: (errors, position, message) => {
        return exports.stsParser.addItemToArray(errors, astFactory_1.astFactory.createParsingError(position, message));
    },
    addItemToArray: (source, item) => {
        source = source || [];
        return [
            ...source,
            item
        ];
    },
    addItemToHash: (source, key, item) => {
        source = source || {};
        return Object.assign({}, source, { [key]: item });
    }
};
//# sourceMappingURL=stsParser.js.map