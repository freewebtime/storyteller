import { IHash } from "../../../api/IHash";
import { ICardboard } from "../../../api/ide/cardboards/ICardboard";
import { IAction } from "../../../api/IAction";
import { cardboardReducer } from "./cardboardReducer";
import { IProject } from "../../../api/project/IProject";

export const cardboardsReducer = (state: IHash<ICardboard> = {}, project: IProject, action: IAction) => {

  Object.keys(state).map((cardboardId: string) => {
    const cardboard = state[cardboardId];
    const newCardboard = cardboardReducer(cardboard, project, action);
    if (cardboard !== newCardboard) {
      state = {
        ...state,
        [cardboardId]: newCardboard,
      }
    }
  })

  return state;
}
