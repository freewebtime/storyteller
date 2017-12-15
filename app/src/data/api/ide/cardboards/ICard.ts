export enum CardType {
  Card = 'Card',
  Subcard = 'Subcard',
}

export interface ICard {
  id: string;
  itemId: string;
  cardType: CardType;
  viewConfig: {
    isCollapsed: boolean;
    isShowName: boolean;
    isShowInputSocket: boolean;
    isShowOutputSocket: boolean;
  },
  position: {
    left?: number;
    top?: number;
  },
  expandedSize: {
    width?: number;
    height?: number;
  },
  collapsedSize: {
    width?: number;
    height?: number;
  },
}
