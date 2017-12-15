import { IHash } from "../../../api/IHash";
import { ICardboard } from "../../../api/ide/cardboards/ICardboard";
import { IAction } from "../../../api/IAction";
import { cardboardReducer } from "./cardboardReducer";

export const cardboardsReducer = (state: IHash<ICardboard> = {}, action: IAction) => {

  Object.keys(state).map((cardboardId: string) => {
    const cardboard = state[cardboardId];
    const newCardboard = cardboardReducer(cardboard, action);
    if (cardboard !== newCardboard) {
      state = {
        ...state,
        [cardboardId]: newCardboard,
      }
    }
  })

  return state;
}
