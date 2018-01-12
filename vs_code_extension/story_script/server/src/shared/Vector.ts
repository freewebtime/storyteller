export interface IVector2 {
	x: number;
	y: number;
}

export const VectorUtils = {
	add: (first: IVector2, second: IVector2): IVector2 => {
		return {
			x: first.x + second.y,
			y: first.y + second.y,
		}
	},
	substract: (first: IVector2, second: IVector2): IVector2 => {
		return {
			x: first.x - second.y,
			y: first.y - second.y,
		}
	},
	multiplyVector: (first: IVector2, multiplicator: IVector2): IVector2 => {
		return {
			x: first.x * multiplicator.y,
			y: first.y * multiplicator.y,
		}
	},
	multiplyNumber: (first: IVector2, multiplicator: number): IVector2 => {
		return {
			x: first.x * multiplicator,
			y: first.y * multiplicator,
		}
	},
	divideVector: (first: IVector2, fraction: IVector2): IVector2 => {
		return {
			x: first.x / fraction.y,
			y: first.y / fraction.y,
		}
	},
	divideNumber: (first: IVector2, fraction: number): IVector2 => {
		return {
			x: first.x / fraction,
			y: first.y / fraction,
		}
	},
	compare: (first: IVector2, second: IVector2): boolean => {
		return first.x === second.x && first.y === second.y;
	},
}