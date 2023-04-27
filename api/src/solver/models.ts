// lat and lng values here are in degrees
export interface Point {
  lat: number;
  lng: number;
}

export type TimeWeights = number[][];

export interface Solver {
  (
    pointsToObserve: Point[],
    startBase: Point,
    restOfBases: Point[],
    timeWeights: TimeWeights,
    chargeTime: number,
  ): Point[];
}
