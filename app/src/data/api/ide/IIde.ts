import { IHash } from "../IHash";
import { ICardboard } from "./cardboards/ICardboard";

export interface IIde {
  cardboards: IHash<ICardboard>;
}
