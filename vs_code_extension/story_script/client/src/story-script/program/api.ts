import { IHash } from "../../shared/IHash";

export enum ProgramItemType {
  Module = 'Module',
  Value = 'Value',
  Object = 'Object',
  Function = 'Function',
  Operation = 'Operation',
}

export enum OperationTypes {
  Set = 'Set',
  Call = 'Call',
}

export enum OperandTypes {
  identifier = 'identifier',
  value = 'value',
  operation = 'operation'
}

export enum ClassTypes {
  value = 'value',
  object = 'object',
  array = 'array',
  function = 'function',
}

export enum ValueTypes {
  void = 'void',
  string = 'string',
  number = 'number',
  boolean = 'boolean'
}

export interface IOperation {
  type: OperationTypes;
  leftOperand: IOperand;
  rightOperand: IOperand;
  returns: IClass; 
}

export interface IOperand {
  type: OperandTypes;
}

export interface IClass {
  type: ClassTypes;
}

export interface IClassValue extends IClass {
  valueType: ValueTypes;
  value: any;
}

export interface IClassObject extends IClass {
  fields: IHash<IIdentifier>;
}

export interface IClassArray extends IClass {
  itemType?: IClass;
}

export interface IClassFunction extends IClass {
  params: IHash<IIdentifier>;
  returns: IClass;
  body: IProgram;
}

export interface IIdentifier {
  name: string;
  type?: IClass;
  value?: IOperand;
}

export interface IProgram {
  operations: IOperation[];
}

export interface IModule extends IClassFunction {
  name: string;
  fullName: string;
  filePath: string;
}

