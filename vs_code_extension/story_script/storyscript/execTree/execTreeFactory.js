"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IExecTree_1 = require("../shared/IExecTree");
exports.execTreeFactory = {
    createOperation: (left, right, operationType, start, end) => {
        return {
            left: left,
            right: right,
            operationType: operationType,
            type: IExecTree_1.ExecTreeType.operation,
            start,
            end
        };
    },
    createIdentifier: (value, start, end) => {
        return {
            type: IExecTree_1.ExecTreeType.identifier,
            value: value,
            start,
            end
        };
    },
    createCall: (target, params, start, end) => {
        return {
            type: IExecTree_1.ExecTreeType.call,
            target: target,
            params: params,
            start,
            end
        };
    },
    createValue: (value, valueType, start, end) => {
        return {
            type: IExecTree_1.ExecTreeType.value,
            value: value,
            valueType: valueType,
            start,
            end
        };
    },
    createValueAny: (value, start, end) => {
        return exports.execTreeFactory.createValue(value, IExecTree_1.ExecTreeValueType.any, start, end);
    },
    createString: (value, start, end) => {
        return exports.execTreeFactory.createValue(value, IExecTree_1.ExecTreeValueType.string, start, end);
    },
    createNumber: (value, start, end) => {
        return exports.execTreeFactory.createValue(value, IExecTree_1.ExecTreeValueType.number, start, end);
    },
    createBoolean: (value, start, end) => {
        return exports.execTreeFactory.createValue(value, IExecTree_1.ExecTreeValueType.boolean, start, end);
    },
    createArray: (value, start, end) => {
        return {
            type: IExecTree_1.ExecTreeType.array,
            value: value,
            start,
            end
        };
    },
    createObject: (fields, start, end) => {
        return {
            type: IExecTree_1.ExecTreeType.object,
            fields: fields,
            start,
            end
        };
    },
    createFunction: (body, functionParams, start, end) => {
        return {
            type: IExecTree_1.ExecTreeType.function,
            body: body,
            params: functionParams,
            start,
            end
        };
    },
};
//# sourceMappingURL=execTreeFactory.js.map