export enum SocketType {
  Input = 'Input',
  Output = 'Output',
}

export interface ICardSocket {
  id: string;
  cardId: string;
  socketType: SocketType;
  isConnected?: boolean;
  isVisible: boolean;
  isTargetVisible?: boolean;
}
