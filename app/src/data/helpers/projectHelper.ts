import { SocketType } from "../api/ide/cardboards/ICardSocket";

export const socketPrefix = (socketType: SocketType) => {
  return `card-socket-${socketType}-`;
}
export const getSocketId = (itemId: string, socketType: SocketType) => {
  return `${socketPrefix(socketType)}(${itemId})`;
}
