import { IHash } from "../IHash";

export const ObjectTypes = {
}

export interface IObject {
  objectType: string;
  id: string;
  parentId?: string;
  name?: string;
  typeReference?: string;
  valueReference?: string;
}

export interface IPrimitive extends IObject {
  primitiveType: string;
  value?: any;
}

export interface IStructure extends IObject {
  subitems: IHash<string>;
}

export interface IFunction extends IStructure {
}
