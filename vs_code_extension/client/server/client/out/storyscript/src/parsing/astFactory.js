"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AstNodeTypes_1 = require("../shared/AstNodeTypes");
exports.astFactory = {
    createParsingError: (position, message) => {
        return {
            message,
            position
        };
    },
    createModule: (program, name, start, end) => {
        return {
            type: AstNodeTypes_1.AstNodeTypes.module,
            name: name,
            program: program,
            start,
            end
        };
    },
    createCall: (params, start, end) => {
        return {
            type: AstNodeTypes_1.AstNodeTypes.call,
            params: params,
            start,
            end
        };
    },
    createImport: (name, path, indent, start, end) => {
        return {
            type: AstNodeTypes_1.AstNodeTypes.import,
            name: name,
            path: path,
            indent: indent,
            start: start,
            end: end,
        };
    },
    createProgram: (body, start, end) => {
        return {
            type: AstNodeTypes_1.AstNodeTypes.program,
            body: body,
            start: start,
            end: end,
        };
    },
    createVariable: (name, varType, value, indent, start, end) => {
        return {
            type: AstNodeTypes_1.AstNodeTypes.variable,
            name: name,
            value: value,
            varType: varType,
            indent: indent,
            start: start,
            end: end,
        };
    },
    createAddText: (value, indent, start, end) => {
        return {
            type: AstNodeTypes_1.AstNodeTypes.addText,
            value: value,
            indent: indent,
            start: start,
            end: end,
        };
    },
    createMention: (target, start, end) => {
        return {
            type: AstNodeTypes_1.AstNodeTypes.mention,
            target: target,
            start: start,
            end: end,
        };
    },
    createString: (value, start, end) => {
        return {
            type: AstNodeTypes_1.AstNodeTypes.string,
            value: value,
            start: start,
            end: end,
        };
    },
    createArray: (items, start, end) => {
        return {
            type: AstNodeTypes_1.AstNodeTypes.array,
            items,
            start,
            end
        };
    },
    createTemplate: (items, start, end) => {
        return {
            type: AstNodeTypes_1.AstNodeTypes.template,
            items,
            start,
            end
        };
    },
    createIdentifier: (name, start, end) => {
        return {
            type: AstNodeTypes_1.AstNodeTypes.identifier,
            name: name,
            start: start,
            end: end,
        };
    },
};
//# sourceMappingURL=astFactory.js.map