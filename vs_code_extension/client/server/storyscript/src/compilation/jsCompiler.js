"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsCompilerTemplates_1 = require("./jsCompilerTemplates");
const AstNodeTypes_1 = require("../shared/AstNodeTypes");
exports.jsCompiler = {
    compile: (ast) => {
        let result = exports.jsCompiler.compileAstNode(ast, []);
        return result;
    },
    compileAstNode: (ast, parent) => {
        if (!ast) {
            return undefined;
        }
        if (ast.type === AstNodeTypes_1.AstNodeTypes.module) {
            let moduleNode = ast;
            if (moduleNode) {
                return exports.jsCompiler.compileModule(moduleNode);
            }
        }
        if (ast.type === AstNodeTypes_1.AstNodeTypes.import) {
            let importNode = ast;
            if (importNode) {
                return exports.jsCompiler.compileImport(importNode, parent);
            }
        }
        if (ast.type === AstNodeTypes_1.AstNodeTypes.variable) {
            let varNode = ast;
            if (varNode) {
                return exports.jsCompiler.compileVariable(varNode, parent);
            }
        }
        if (ast.type === AstNodeTypes_1.AstNodeTypes.mention) {
            let mentionNode = ast;
            if (mentionNode) {
                return exports.jsCompiler.compileMention(mentionNode, parent);
            }
        }
        if (ast.type === AstNodeTypes_1.AstNodeTypes.string) {
            let strNode = ast;
            if (strNode) {
                return strNode.value;
            }
        }
        if (ast.type === AstNodeTypes_1.AstNodeTypes.array) {
            let astArray = ast;
            if (astArray) {
                let result = '';
                astArray.items.forEach((subitem) => {
                    let itemResult = exports.jsCompiler.compileAstNode(subitem, parent);
                    if (itemResult) {
                        result += itemResult + '\r';
                    }
                });
                return result;
            }
        }
        if (ast.type === AstNodeTypes_1.AstNodeTypes.addText) {
            let addTextNode = ast;
            if (addTextNode) {
                return exports.jsCompiler.compileAddText(addTextNode, parent);
            }
        }
        if (ast.type === AstNodeTypes_1.AstNodeTypes.identifier) {
            let identifierNode = ast;
            if (identifierNode) {
                let result = exports.jsCompiler.createIdentifierFromAst(identifierNode.name.items, parent);
                return result;
            }
        }
        if (ast.type === AstNodeTypes_1.AstNodeTypes.template) {
            let templAst = ast;
            if (templAst) {
                let result = '`';
                templAst.items.forEach((subitem) => {
                    let itemResult = exports.jsCompiler.compileAstNode(subitem, parent);
                    if (itemResult) {
                        result += itemResult;
                    }
                });
                return result + '`';
            }
        }
        if (ast.type === AstNodeTypes_1.AstNodeTypes.program) {
            let astProgram = ast;
            if (astProgram) {
                let result = '';
                astProgram.body.forEach((subitem) => {
                    let itemResult = exports.jsCompiler.compileAstNode(subitem, parent);
                    if (itemResult) {
                        result += itemResult;
                    }
                });
                return result;
            }
        }
        if (ast.type === AstNodeTypes_1.AstNodeTypes.call) {
            let astNode = ast;
            if (astNode) {
                let result = '(';
                astNode.params.forEach((subitem, index, array) => {
                    let itemResult = exports.jsCompiler.compileAstNode(subitem, parent);
                    if (itemResult) {
                        result += itemResult;
                        if (index < array.length - 1) {
                            result += ', ';
                        }
                    }
                });
                result += ')';
                return result;
            }
        }
        return ''; //ast.toString();
    },
    compileModule: (astNode) => {
        const header = jsCompilerTemplates_1.jsCompilerTemplates.moduleHeader;
        const body = exports.jsCompiler.compileAstNode(astNode.program, []);
        const footer = jsCompilerTemplates_1.jsCompilerTemplates.moduleFooter;
        return `${header}\r${body}\r${footer}`;
    },
    compileMention: (ast, parent) => {
        if (!ast) {
            return undefined;
        }
        let identifier = exports.jsCompiler.compileAstNode(ast.target, parent);
        const result = jsCompilerTemplates_1.jsCompilerTemplates.mentionTemplate(identifier);
        return result;
    },
    compileImport: (ast, parent) => {
        if (!ast) {
            return undefined;
        }
        let varName = ast.name.value;
        let contextName = exports.jsCompiler.createIdentifierFromAst(parent, parent);
        let importPath = ast.path.value;
        let result = jsCompilerTemplates_1.jsCompilerTemplates.importTemplate(contextName, varName, importPath);
        result += '\r';
        return result;
    },
    compileVariable: (ast, parent) => {
        if (!ast) {
            return undefined;
        }
        let varName = ast.name.value;
        let contextName = exports.jsCompiler.createIdentifierFromAst(parent, parent);
        let result = jsCompilerTemplates_1.jsCompilerTemplates.variableTemplate(contextName, varName) + '\r';
        let subparent = [...parent, ast.name];
        let subitems = exports.jsCompiler.compileAstNode(ast.value, subparent);
        if (subitems) {
            result = `${result}${subitems}`;
        }
        return result;
    },
    compileAddText: (ast, parent) => {
        if (!ast) {
            return undefined;
        }
        let textValue = exports.jsCompiler.compileAstNode(ast.value, parent);
        let contextName = exports.jsCompiler.createIdentifierFromAst(parent, parent);
        let result = jsCompilerTemplates_1.jsCompilerTemplates.addTextTemplate(contextName, textValue) + '\n';
        return result;
    },
    createIdentifierFromAst: (nameParts, parent) => {
        if (!nameParts || nameParts.length <= 0) {
            return 'context';
        }
        let compiledParts = nameParts.map((namePart, index, array) => {
            let compiledPart = exports.jsCompiler.compileAstNode(namePart, parent);
            if (namePart.type !== AstNodeTypes_1.AstNodeTypes.call) {
                compiledPart = `["${compiledPart}"]`;
            }
            return compiledPart;
        });
        let result = 'context' + compiledParts.join('');
        return result;
    },
    createIdentifier: (nameParts) => {
        if (!nameParts || nameParts.length <= 0) {
            return 'context';
        }
        let result = 'context["' + nameParts.join('"]["') + '"]';
        return result;
    },
};
//# sourceMappingURL=jsCompiler.js.map