// lat and lng values here are in degrees
export interface Point {
  lat: Degrees;
  lng: Degrees;
}

export type TimeWeights = Milliseconds[][];

export interface Solver {
  (
    pointsToObserve: Point[],
    startBase: Point,
    restOfBases: Point[],
    timeWeights: TimeWeights,
    chargeTime: Milliseconds,
  ): Point[];
}

export type Milliseconds = number;
export type Kilometers = number;
export type Degrees = number;
export type KilometersPeHour = number;
