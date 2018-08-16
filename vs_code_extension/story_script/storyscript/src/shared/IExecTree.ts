import { OperationType } from "./OperationType";
import { IHash } from "./IHash";
import { ISymbolPosition } from "./ISymbolPosition";

export enum ExecTreeType {
  operation = 'operation',
  identifier = 'identifier',
  call = 'call',
  value = 'value',
  object = 'object',
  function = 'function',
  array = 'array',
}

export enum ExecTreeValueType {
  any = 'any',
  string = 'string',
  number = 'number',
  boolean = 'boolean',
}

export interface IExecTree {
  type: ExecTreeType;
  start?: ISymbolPosition;
  end?: ISymbolPosition;
}

export interface IExecTreeOperation extends IExecTree {
  left: IExecTree;
  operationType: OperationType;
  right: IExecTree;
}

export interface IExecTreeIdentifier extends IExecTree {
  value: string[];
}

export interface IExecTreeCall extends IExecTree {
  target: IExecTreeIdentifier;
  params: IExecTree[];
}

export interface IExecTreeValue extends IExecTree {
  valueType: ExecTreeValueType;
  value: any;
}

export interface IExecTreeValueString extends IExecTreeValue {
  value: string;
}
export interface IExecTreeValueNumber extends IExecTreeValue {
  value: number;
}
export interface IExecTreeValueBoolean extends IExecTreeValue {
  value: boolean;
}

export interface IExecTreeArray extends IExecTree {
  value: IExecTree[];
};
export interface IExecTreeObject extends IExecTree {
  fields: IHash<IExecTree>;
}
export interface IExecTreeFunction extends IExecTree {
  params: IHash<IExecTree>;
  body: IExecTree[];
}

