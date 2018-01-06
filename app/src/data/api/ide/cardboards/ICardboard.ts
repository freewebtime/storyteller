import { IHash } from "../../IHash";
import { ICard } from "./ICard";
import { ICardSocket } from "./ICardSocket";

export interface ICardboard {
  id: string;
  cards: IHash<ICard>;
  rootCards: IHash<string>;
  cardSockets: IHash<ICardSocket>;
  visibleCards: IHash<string>;
  visibleSockets: IHash<string>;
}

