// lat and lng values here are in degrees
export interface Point {
  lat: Degrees;
  lng: Degrees;
  isBase: boolean;
}

export type TimeWeights = Milliseconds[][];

export interface Solver {
  (
    pointsToObserve: Point[],
    startBase: Point,
    anotherBase: Point,
    chargeTime: Milliseconds,
    maxFlightTime: Milliseconds,
    speed: KilometersPeHour,
  ): { route: Point[]; fitness: number };
}

export type Milliseconds = number;
export type Kilometers = number;
export type Degrees = number;
export type KilometersPeHour = number;

export interface Solution {
  route: Point[];
  fitness: number;
}
