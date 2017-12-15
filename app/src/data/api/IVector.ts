export interface IVector2 {
  x: number;
  y: number;
}

export interface IVector3 extends IVector2 {
  z: number;
}

export interface IVector4 extends IVector3 {
  w: number;
}

export const addVector2 = (first: IVector2, second: IVector2): IVector2 => {
  return {
    x: first.x + second.x,
    y: first.y + second.y,
  }
}
export const substractVector2 = (first: IVector2, second: IVector2): IVector2 => {
  return {
    x: first.x - second.x,
    y: first.y - second.y,
  }
}

