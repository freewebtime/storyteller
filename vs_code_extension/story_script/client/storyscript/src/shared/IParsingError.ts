import { ISymbolPosition } from "./ISymbolPosition";

export interface IParsingError {
  position: ISymbolPosition;
  message: string;
}
