"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokenizerConfig_1 = require("./tokenizerConfig");
const CodeTokenType_1 = require("../shared/CodeTokenType");
exports.stsTokenizer = {
    tokenizeCode: (sourceCode) => {
        let state = {
            sourceCode: sourceCode,
            cursor: {
                line: 0,
                symbol: 0
            },
            globalCursor: 0,
            tokens: [],
        };
        let nextToken;
        while (nextToken = exports.stsTokenizer.getNextToken(state, CodeTokenType_1.CodeTokenType.Word)) {
            state = exports.stsTokenizer.addToken(state, nextToken);
        }
        return state.tokens;
    },
    getNextToken: (state, fallbackTokenType, pattern) => {
        if (exports.stsTokenizer.isEndOfFile(state)) {
            return undefined;
        }
        pattern = pattern || tokenizerConfig_1.stsConfig.allSeparatorsPattern;
        pattern = tokenizerConfig_1.stsConfig.wrapPatternWithCursorPos(pattern, state.globalCursor);
        const regexp = new RegExp(pattern);
        let match = regexp.exec(state.sourceCode);
        let searchIndex = match ? match.index : 0;
        if (!match) {
            if (state.globalCursor < state.sourceCode.length) {
                //check is it last token in file
                let pattern2 = `(?:.|\\r|\\n){${state.globalCursor}}(.*)`;
                match = new RegExp(pattern2).exec(state.sourceCode);
            }
            if (!match) {
                return undefined;
            }
        }
        let tokenLength;
        let tokenValue;
        let tokenType;
        if (searchIndex === 0) {
            tokenValue = match[0].substr(state.globalCursor);
            tokenType = tokenizerConfig_1.stsConfig.getTokenType(tokenValue) || fallbackTokenType;
            tokenLength = tokenValue.length;
        }
        if (!tokenValue) {
            //token type is fallbackTokenType
            tokenLength = searchIndex;
            tokenValue = state.sourceCode.substr(state.globalCursor, tokenLength) || '';
            tokenType = fallbackTokenType;
        }
        const start = Object.assign({}, state.cursor);
        const end = Object.assign({}, start, { symbol: start.symbol + tokenLength });
        let token = {
            type: tokenType,
            value: tokenValue,
            start,
            end,
            length: tokenLength,
        };
        return token;
    },
    addToken: (state, token) => {
        const tokens = [
            ...state.tokens,
            token,
        ];
        const tokenLenght = token.end.symbol - token.start.symbol;
        const globalCursor = state.globalCursor + tokenLenght;
        let cursor = Object.assign({}, state.cursor);
        if (token.type === CodeTokenType_1.CodeTokenType.Endline) {
            cursor = {
                line: cursor.line + 1,
                symbol: 0,
            };
        }
        else {
            cursor = Object.assign({}, state.cursor, { symbol: state.cursor.symbol + tokenLenght });
        }
        state = Object.assign({}, state, { tokens,
            globalCursor,
            cursor });
        return state;
    },
    isEndOfFile: (state) => {
        return !state.sourceCode || state.globalCursor >= state.sourceCode.length;
    }
};
//# sourceMappingURL=stsTokenizer.js.map