import { IIde } from "../../api/ide/IIde";
import { IAction } from "../../api/IAction";
import { cardboardsReducer } from "./cardboards/cardboardsReducer";
import { IProject } from "../../api/project/IProject";

const initialState: IIde = {
  cardboards: {},
}

export const ideReducer = (state: IIde = initialState, project: IProject, action: IAction) => {
  const newCardboards = cardboardsReducer(state.cardboards, project, action);
  if (newCardboards !== state.cardboards) {
    const newValues: any = {
      cardboards: newCardboards,
    }

    state = {
      ...state,
      ...newValues,
    }
  }

  return state;
}
