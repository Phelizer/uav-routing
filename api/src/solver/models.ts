// Domain models:

// lat and lng values here are in degrees
export interface Point {
  lat: Degrees;
  lng: Degrees;
  isBase: boolean;
  isStartBase: boolean;
  label: string;
  id: number;
}

export type Coords = Pick<Point, 'lat' | 'lng'>;

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

export type AlgorithmName = 'tabu' | 'bees' | 'ants';

// Interfaces:

export interface CalculateRouteInputData {
  pointsToObserve: Point[];
  startBase: Point;
  anotherBase: Point;
  chargeTime: Milliseconds;
  maxFlightTime: Milliseconds;
  speed: KilometersPeHour;
}

export interface PerformExperimentInputData {
  numberOfPoints: number;
  numberOfRuns: number;
  algorithm: AlgorithmName;
}

export interface Result {
  route: Point[];
  fitness: number;
}
