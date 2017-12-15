import { IItem } from "./IItem";

export interface IPrimitive extends IItem {
  primitiveType: string;
  value?: any;
}
