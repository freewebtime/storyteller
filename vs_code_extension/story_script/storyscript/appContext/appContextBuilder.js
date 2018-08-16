"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IAppContext_1 = require("../shared/IAppContext");
const AstNodeTypes_1 = require("../shared/AstNodeTypes");
exports.appContextBuilder = {
    CreateModuleContext: (ast, moduleName) => {
        if (!ast) {
            return undefined;
        }
        // create moduleItems
        let moduleItems = exports.appContextBuilder.CreateModuleItems(ast);
        let moduleStart = ast.start;
        let moduleEnd = ast.end;
        let result = IAppContext_1.appContextFactory.createModule(moduleName, moduleItems, moduleStart, moduleEnd);
        return result;
    },
    CreateModuleItems: (astModule) => {
        if (!astModule || !astModule.body || !astModule.body) {
            return undefined;
        }
        // go through all the subitems of the module
        // let subitems = astModule.program.body.map((subNode: IAstNode) => {
        //   let subitem = appContextBuilder.readAstNode(subNode);
        //   return subitem;
        // });
        let result = {};
        return result;
    },
    readModule: (astModule, moduleName) => {
        if (!astModule || !astModule.body || !astModule.body) {
            return undefined;
        }
        let items = {};
        let appModule = IAppContext_1.appContextFactory.createModule(moduleName, items, astModule.start, astModule.end);
        let programBody = astModule.body;
        programBody.items.forEach((subAst) => {
            let appItem = exports.appContextBuilder.readAstNode(subAst, items);
            if (appItem) {
            }
        });
        return appModule;
    },
    readAstNode: (ast, context) => {
        if (!ast) {
            return undefined;
        }
        let name;
        let result;
        switch (ast.type) {
            case AstNodeTypes_1.AstNodeTypes.import: {
                // add variable to context
                return exports.appContextBuilder.readAstImport(ast, context);
            }
            case AstNodeTypes_1.AstNodeTypes.variable: {
                // add variable to context
                return exports.appContextBuilder.readAstVariable(ast, context);
            }
            default:
                { }
                break;
        }
        if (!result) {
            return undefined;
        }
        return {
            context: context,
            name: name,
            result: result,
        };
    },
    readAstImport: (ast, context) => {
        if (!ast) {
            return undefined;
        }
        let name = ast.name.value || 'unnamed';
        let importPath;
        if (ast.path) {
            importPath = ast.path.value;
        }
        let result = IAppContext_1.appContextFactory.createImport(importPath, ast.start, ast.end);
        return {
            context: context,
            name: name,
            result: result
        };
    },
    readAstVariable: (ast, context) => {
        if (!ast) {
            return undefined;
        }
        let name = ast.name.value || 'unnamed';
        // it can be object or value
        // check subitems. if any, this is an object. otherwise - value
        if (ast.value) {
        }
        return undefined;
    },
};
//# sourceMappingURL=appContextBuilder.js.map