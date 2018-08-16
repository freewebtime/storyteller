"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AstNodeTypes_1 = require("../shared/AstNodeTypes");
const execTreeFactory_1 = require("./execTreeFactory");
const OperationType_1 = require("../shared/OperationType");
exports.execTreeParser = {
    parseModule: (ast) => {
        if (!ast || !ast.body) {
            return undefined;
        }
        let start = ast.start;
        let end = ast.end;
        let operations = [];
        ast.body.items.forEach((itemNode) => {
            let itemOperations = exports.execTreeParser.parseNode(itemNode, []);
            if (itemOperations) {
                operations = [
                    ...operations,
                    ...itemOperations
                ];
            }
        });
        // return array of operations
        let result = execTreeFactory_1.execTreeFactory.createArray(operations, start, end);
        return result;
    },
    parseNode: (ast, parent) => {
        if (!ast) {
            return undefined;
        }
        switch (ast.type) {
            case AstNodeTypes_1.AstNodeTypes.variable: {
                return exports.execTreeParser.parseVariable(ast, parent);
            }
            case AstNodeTypes_1.AstNodeTypes.addText: {
                return exports.execTreeParser.parseAddText(ast, parent);
            }
            case AstNodeTypes_1.AstNodeTypes.template: {
                let template = exports.execTreeParser.parseTemplate(ast, parent);
                return [template];
            }
            case AstNodeTypes_1.AstNodeTypes.string: {
                let str = exports.execTreeParser.parseString(ast);
                return [str];
            }
            case AstNodeTypes_1.AstNodeTypes.array: {
                let array = exports.execTreeParser.parseArray(ast, parent);
                return array;
            }
            case AstNodeTypes_1.AstNodeTypes.import: {
                let array = exports.execTreeParser.parseImport(ast, parent);
                return array;
            }
        }
        return undefined;
    },
    parseString: (astString) => {
        if (!astString) {
            return undefined;
        }
        let result = execTreeFactory_1.execTreeFactory.createString(astString.value, astString.start, astString.end);
        return result;
    },
    parseIdentifier: (astIdentifier, parent) => {
        if (!astIdentifier || !astIdentifier.name || !astIdentifier.name.items) {
            return undefined;
        }
        // identifier
        let result;
        let nameItemsAst = astIdentifier.name.items;
        let nameParts = nameItemsAst.map((nameItemAst) => {
            // name items can be string or (in future) operation
            switch (nameItemAst.type) {
                case AstNodeTypes_1.AstNodeTypes.string: {
                    let strNode = nameItemAst;
                    if (strNode) {
                        return strNode.value;
                    }
                }
            }
            return undefined;
        });
        // skip all the undefined name parts
        nameParts = nameParts.filter((value) => {
            if (value) {
                return value;
            }
            return undefined;
        });
        nameParts = [
            ...parent,
            ...nameParts
        ];
        result = execTreeFactory_1.execTreeFactory.createIdentifier(nameParts, astIdentifier.start, astIdentifier.end);
        return result;
    },
    parseArray: (astArray, parent) => {
        if (!astArray || !astArray.items) {
            return undefined;
        }
        let result = [];
        astArray.items.map((subitem) => {
            let itemResult = exports.execTreeParser.parseNode(subitem, parent);
            if (itemResult) {
                result = [
                    ...result,
                    ...itemResult
                ];
            }
        });
        return result;
    },
    parseImport: (ast, parent) => {
        if (!ast) {
            return undefined;
        }
        let result = [];
        // get full variable name
        let varName = ast.name.value;
        let fullName = [...parent, varName];
        // variable declaration
        result = exports.execTreeParser.createVarDeclarations(fullName);
        // set value if any
        if (ast.path) {
            let importCallPath = execTreeFactory_1.execTreeFactory.createIdentifier(['require'], ast.path.start, ast.path.end);
            let importCallParams = [exports.execTreeParser.parseString(ast.path)];
            let importCall = execTreeFactory_1.execTreeFactory.createCall(importCallPath, importCallParams, ast.path.start, ast.path.end);
            result = [
                ...result,
                importCall
            ];
        }
        return result;
    },
    parseMention: (astMention, parent) => {
        if (!astMention) {
            return undefined;
        }
        // mention is a get operation
        let leftOperand = undefined;
        let rightOperand;
        let targetAst = astMention.target;
        // mention target can be identifier or operation
        switch (targetAst.type) {
            case AstNodeTypes_1.AstNodeTypes.identifier:
                {
                    let identifier = exports.execTreeParser.parseIdentifier(targetAst, []);
                    rightOperand = identifier;
                }
                break;
        }
        let result = execTreeFactory_1.execTreeFactory.createOperation(leftOperand, rightOperand, OperationType_1.OperationType.Get, astMention.start, astMention.end);
        return result;
    },
    parseVariable: (astVar, parent) => {
        if (!astVar) {
            return undefined;
        }
        let result = [];
        // get full variable name
        let varName = astVar.name.value;
        let fullName = [...parent, varName];
        // variable declaration
        result = exports.execTreeParser.createVarDeclarations(fullName);
        // set value if any
        if (astVar.value) {
            let varValueOperations = exports.execTreeParser.parseNode(astVar.value, fullName);
            result = [
                ...result,
                ...varValueOperations
            ];
        }
        return result;
    },
    parseAddText: (astAddText, parent) => {
        if (!astAddText) {
            return undefined;
        }
        let result = [];
        // get full variable name
        let fullName = [...parent];
        // variable declaration
        result = exports.execTreeParser.createVarDeclarations(fullName);
        // set value
        if (astAddText.value) {
            let varValueOperations = exports.execTreeParser.parseNode(astAddText.value, fullName);
            result = [
                ...result,
                ...varValueOperations
            ];
        }
        return result;
    },
    parseTemplate: (astTemplate, parent) => {
        if (!astTemplate || !astTemplate.items) {
            return undefined;
        }
        let words = astTemplate.items.map((wordAst) => {
            // word can be string or mention
            switch (wordAst.type) {
                case AstNodeTypes_1.AstNodeTypes.string: {
                    let subitem = exports.execTreeParser.parseString(wordAst);
                    if (subitem) {
                        return subitem;
                    }
                }
                case AstNodeTypes_1.AstNodeTypes.mention: {
                    let subitem = exports.execTreeParser.parseMention(wordAst, []);
                    if (subitem) {
                        return subitem;
                    }
                }
            }
            return undefined;
        }).filter((value) => {
            if (value)
                return value;
            return undefined;
        });
        // return result
        let result = execTreeFactory_1.execTreeFactory.createArray(words, astTemplate.start, astTemplate.end);
        return result;
    },
    createVarDeclarations: (fullName, start, end) => {
        if (!fullName) {
            return undefined;
        }
        let result = [];
        // declare all variable parts
        for (let i = 0; i < fullName.length; i++) {
            const fullSubname = fullName.slice(0, i + 1);
            // create variable declaration call
            let declareCallTarget = execTreeFactory_1.execTreeFactory.createIdentifier(exports.execTreeParser.varDeclarationPath, start, end);
            let declareCallParam = fullSubname.map((dcSubname) => {
                return execTreeFactory_1.execTreeFactory.createString(dcSubname);
            });
            let declareParams = execTreeFactory_1.execTreeFactory.createArray(declareCallParam, start, end);
            let declareCall = execTreeFactory_1.execTreeFactory.createCall(declareCallTarget, [declareParams], start, end);
            result = [
                ...result,
                declareCall
            ];
        }
        return result;
    },
    contextPath: ['context'],
    varDeclarationPath: ['__environment', 'declare'],
    setValuePath: ['__environment', 'setValue'],
};
//# sourceMappingURL=execTreeParser.js.map