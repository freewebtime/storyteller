import { IExecTree, IExecTreeOperation, IExecTreeIdentifier, ExecTreeValueType, IExecTreeValue, IExecTreeCall, IExecTreeValueString, IExecTreeValueNumber, IExecTreeValueBoolean, IExecTreeArray, IExecTreeObject, ExecTreeType, IExecTreeFunction } from "../shared/IExecTree";
import { ISymbolPosition } from "../shared/ISymbolPosition";
import { OperationType } from "../shared/OperationType";
import { IHash } from "../shared/IHash";

export const execTreeFactory = {
  createOperation: (left: IExecTree, right: IExecTree, operationType: OperationType, start?: ISymbolPosition, end?: ISymbolPosition): IExecTreeOperation => {
    return {
      left: left,
      right: right,
      operationType: operationType,
      type: ExecTreeType.operation,
      start,
      end
    }
  },
  createIdentifier: (value: string[], start?: ISymbolPosition, end?: ISymbolPosition): IExecTreeIdentifier => {
    return {
      type: ExecTreeType.identifier,
      value: value,
      start,
      end
    }
  },
  createCall: (target: IExecTreeIdentifier, params: IExecTree[], start?: ISymbolPosition, end?: ISymbolPosition): IExecTreeCall => {
    return {
      type: ExecTreeType.call,
      target: target,
      params: params,
      start,
      end
    }
  },
  createValue: (value: any, valueType: ExecTreeValueType, start?: ISymbolPosition, end?: ISymbolPosition): IExecTreeValue => {
    return {
      type: ExecTreeType.value,
      value: value,
      valueType: valueType,
      start,
      end
    }
  },
  createValueAny: (value: any, start?: ISymbolPosition, end?: ISymbolPosition): IExecTreeValue => {
    return execTreeFactory.createValue(value, ExecTreeValueType.any, start, end);
  },
  createString: (value: string, start?: ISymbolPosition, end?: ISymbolPosition): IExecTreeValueString => {
    return execTreeFactory.createValue(value, ExecTreeValueType.string, start, end);
  },
  createNumber: (value: number, start?: ISymbolPosition, end?: ISymbolPosition): IExecTreeValueNumber => {
    return execTreeFactory.createValue(value, ExecTreeValueType.number, start, end);
  },
  createBoolean: (value: boolean, start?: ISymbolPosition, end?: ISymbolPosition): IExecTreeValueBoolean => {
    return execTreeFactory.createValue(value, ExecTreeValueType.boolean, start, end);
  },

  createArray: (value: IExecTree[], start?: ISymbolPosition, end?: ISymbolPosition): IExecTreeArray => {
    return {
      type: ExecTreeType.array,
      value: value,
      start,
      end
    }
  },
  createObject: (fields: IHash<IExecTree>, start?: ISymbolPosition, end?: ISymbolPosition): IExecTreeObject => {
    return {
      type: ExecTreeType.object,
      fields: fields,
      start,
      end
    }
  },
  createFunction: (body: IExecTree[], functionParams: IHash<IExecTree>, start?: ISymbolPosition, end?: ISymbolPosition): IExecTreeFunction => {
    return {
      type: ExecTreeType.function,
      body: body,
      params: functionParams,
      start,
      end
    }
  },
}