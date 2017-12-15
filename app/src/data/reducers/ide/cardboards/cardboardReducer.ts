import { ICardboard } from "../../../api/ide/cardboards/ICardboard";
import { IAction } from "../../../api/IAction";
import { IHash } from "../../../api/IHash";
import { ICard } from "../../../api/ide/cardboards/ICard";
import { cardsReducer } from "./cardsReducer";
import uuidv4 from 'uuid/v4';
import { IProject } from "../../../api/project/IProject";
import { appConfig } from "../../../config/appConfig";
import { IStructure } from "../../../api/project/IStructure";
import { ICardSocket, SocketType } from "../../../api/ide/cardboards/ICardSocket";
import { getSocketId } from "../../../helpers/projectHelper";

const initialState: ICardboard = {
  id: uuidv4(),
  cards: {},
  rootCards: {},
  cardSockets: {},
  visibleCards: {},
  visibleSockets: {},
}

const checkRootCards = (state: IHash<string>, cards: IHash<ICard>, project: IProject) => {
  Object.keys(cards).map((cardId: string) => {
    const card = cards[cardId];
    const item = project.items[card.itemId];

    if (item.parentId && state[cardId]) {
      state = {...state}
      delete state[cardId];
    } else if (!item.parentId && !state[cardId]) {
      state = {
        ...state,
        [cardId]: cardId,
      }
    }
  })

  return state;
}

const checkCardVisibility = (visibleCards: IHash<string>, card: ICard, cards: IHash<ICard>, project: IProject, parentIsCollapsed: boolean) => {
  const isCardCollapsed = card.viewConfig.isCollapsed || parentIsCollapsed;
  if (isCardCollapsed && visibleCards[card.id]) {
    visibleCards = {...visibleCards}
    delete visibleCards[card.id];
  } else if (!isCardCollapsed && !visibleCards[card.id]) {
    visibleCards = {
      ...visibleCards,
      [card.id]: card.id,
    }
  }

  const item = project.items[card.itemId];
  const structure: IStructure|undefined = item as IStructure;
  if (structure) {
    const subitems = structure.subitems;
    Object.keys(subitems).map((subitemId: string) => {
      const subcard = cards[subitemId];
      if (subcard) {
        visibleCards = checkCardVisibility(visibleCards, subcard, cards, project, isCardCollapsed);
      }
    })
  }

  return visibleCards;
}

const checkVisibleCards = (visibleCards: IHash<string>, cards: IHash<ICard>, rootCards: IHash<string>, project: IProject): IHash<string> => {
  Object.keys(rootCards).map((rootCardId) => {
    const rootCard = cards[rootCardId];
    visibleCards = checkCardVisibility(visibleCards, rootCard, cards, project, false);
  })

  return visibleCards;
}

const checkVisibleSockets = (visibleSockets: IHash<string>, cards: IHash<ICard>, visibleCards: IHash<string>): IHash<string> => {

  Object.keys(cards).map((cardId: string) => {
    const card = cards[cardId];
    const isCardVisible = visibleCards[cardId] ? true : false;

    const isShowInputSocket = isCardVisible && card.viewConfig.isShowInputSocket;
    const inputSocketId = getSocketId(card.itemId, SocketType.Input);
    if (isShowInputSocket && !visibleSockets[inputSocketId]) {
      visibleSockets = {
        ...visibleSockets,
        [inputSocketId]: inputSocketId,
      }
    } else if (!isShowInputSocket && visibleSockets[inputSocketId]) {
      visibleSockets = { ...visibleSockets }
      delete visibleSockets[inputSocketId];
    }

    const isShowOutputSocket = isCardVisible && card.viewConfig.isShowOutputSocket;
    const outputSocketId = getSocketId(card.itemId, SocketType.Output);
    if (isShowOutputSocket && !visibleSockets[outputSocketId]) {
      visibleSockets = {
        ...visibleSockets,
        [outputSocketId]: outputSocketId,
      }
    } else if (!isShowOutputSocket && visibleSockets[outputSocketId]) {
      visibleSockets = { ...visibleSockets }
      delete visibleSockets[outputSocketId];
    }
  })

  return visibleSockets;
}

const updateSockets = (sockets: IHash<ICardSocket>, cards: IHash<ICard>, project: IProject, visibleSockets: IHash<string>) => {
  const result: IHash<ICardSocket> = {}

  Object.keys(cards).map((cardId: string) => {
    const card = cards[cardId];
    const item = project.items[cardId];
    const inputSocketId = getSocketId(card.itemId, SocketType.Input);
    const outputSocketId = getSocketId(card.itemId, SocketType.Output);
    const isInputSocketVisible = visibleSockets[inputSocketId] ? true : false;
    const isOutputSocketVisible = visibleSockets[outputSocketId] ? true : false;
    const isConnected = item.valueReference ? true : false;
    const isTargetVisible = (item.valueReference && (visibleSockets[getSocketId(item.valueReference, SocketType.Input)])) ? true : false;

    let inputSocket: ICardSocket = sockets[inputSocketId] || {
      id: inputSocketId,
      cardId: cardId,
      socketType: SocketType.Input,
      isVisible: isInputSocketVisible,
    };
    if (inputSocket.isVisible !== isInputSocketVisible) {
      inputSocket = {
        ...inputSocket,
        isVisible: isInputSocketVisible,
      }
    }

    let outputSocket: ICardSocket = sockets[outputSocketId] || {
      id: outputSocketId,
      cardId: cardId,
      socketType: SocketType.Input,
      isConnected: isConnected,
      isVisible: isOutputSocketVisible,
      isTargetVisible: isTargetVisible,
    };

    if (outputSocket.isConnected !== isConnected || outputSocket.isVisible !== isOutputSocketVisible || outputSocket.isTargetVisible !== isTargetVisible) {
      outputSocket = {
        ...outputSocket,
        isConnected: isConnected,
        isVisible: isOutputSocketVisible,
        isTargetVisible: isTargetVisible,
      }
    }

    result[inputSocketId] = inputSocket;
    result[outputSocketId] = outputSocket;
  })

  return result;
}

export const cardboardReducer = (state: ICardboard = initialState, project: IProject, action: IAction): ICardboard => {
  const newCards = cardsReducer(state.cards, action);
  if (newCards !== state.cards) {

    const newValues: any = {
      cards: newCards,
    }

    const newRootCards = checkRootCards(state.rootCards, newCards, project);
    if (newRootCards != state.rootCards) {
      newValues.rootCards = newRootCards;

      const newVisibleCards = checkVisibleCards(state.visibleCards, newCards, newRootCards, project);
      if (newVisibleCards !== state.visibleCards) {
        newValues.visibleCards = newVisibleCards;

        const newVisibleSockets = checkVisibleSockets(state.visibleSockets, newCards, newVisibleCards);
        if (newVisibleSockets !== state.visibleSockets) {
          newValues.visibleSockets = newVisibleSockets;
        }
      }
    }

    const visibleSockets: IHash<string> = newValues.visibleSockets || state.visibleSockets || {};
    const newSockets = updateSockets(state.cardSockets, newCards, project, visibleSockets);
    newValues.cardSockets = newSockets;

    state = {
      ...state,
      ...newValues,
    }
  }

  return state;
}
