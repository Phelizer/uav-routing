import { calculateTimeBetweenTwoPoints } from './calculateDistance';
import { KilometersPeHour, Milliseconds, Point, Solver } from './models';

export const tabuSolver: Solver = (
  pointsToObserve: Point[],
  startBase: Point,
  anotherBase: Point,
  chargeTime: Milliseconds,
  maxFlightTime: Milliseconds,
) => {
  // dummy for now
  return [];
};

function generateNeighbor(source: Point[]) {}

// utility:

const createTimeFunc =
  (speed: Milliseconds) => (point1: Point, point2: Point) =>
    calculateTimeBetweenTwoPoints(point1, point2, speed);

function routeIncludesAllPointsToObserve(
  route: Point[],
  pointsToObserve: Point[],
) {
  return pointsToObserve.every((point) => route.includes(point));
}

function routeStartsAndEndsInBases(route: Point[]): boolean {
  const startsWithBase = Boolean((route[0] as any).type === 'base');
  const endsWithBase = Boolean(
    (route[route.length - 1] as any).type === 'base',
  );

  return startsWithBase && endsWithBase;
}

export function isValidRoute(
  route: Point[],
  maxFlightTime: Milliseconds,
  speed: KilometersPeHour,
  pointsToObserve: Point[],
): boolean {
  const time = createTimeFunc(speed);
  let currentFlightTime = 0;
  for (let i = 1; i < route.length; i++) {
    currentFlightTime += time(route[i - 1], route[i]);
    if ((route[i] as any).base) {
      if (currentFlightTime > maxFlightTime) {
        return false;
      }
      currentFlightTime = 0;
    }
  }

  const inspectsAllPoints = routeIncludesAllPointsToObserve(
    route,
    pointsToObserve,
  );

  const startsAndEndsInBases = routeStartsAndEndsInBases(route);

  const result = inspectsAllPoints && startsAndEndsInBases;

  return result;
}
