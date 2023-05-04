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

export function generateNeighbors(
  isValid: (route: Point[]) => boolean,
  source: Point[],
) {
  const neighbors: Point[][] = [];
  // TODO: make this a parameter or refactor this function
  const pointIndex = 6;
  // this can be extracted, calculated one time and reused to avoid
  // unnecessary recalculations. Or can make this function memoizable
  const availablePartnerIndexes = getAvailableSwapPartnerIndexes(
    isValid,
    source,
    pointIndex,
  );

  for (const partI of availablePartnerIndexes) {
    neighbors.push(swap(source, pointIndex, partI));
  }

  return neighbors;
}

function getAvailableSwapPartnerIndexes(
  isValid: (route: Point[]) => boolean,
  route: Point[],
  indexOfPointToSwap: number,
) {
  const availablePartnersIndexes: number[] = [];
  for (let partnerIndex = 0; partnerIndex < route.length; partnerIndex++) {
    const isSelf = partnerIndex === indexOfPointToSwap;
    const isValidNeighbor = isValid(
      swap(route, indexOfPointToSwap, partnerIndex),
    );

    if (isValidNeighbor && !isSelf) {
      availablePartnersIndexes.push(partnerIndex);
    }
  }

  return availablePartnersIndexes;
}

function swap(route: Point[], i: number, j: number): Point[] {
  const newArray = route.slice();
  [newArray[i], newArray[j]] = [newArray[j], newArray[i]];

  return newArray;
}

export const createCalculateTimeFitness =
  (
    speed: KilometersPeHour,
    maxFlightTime: Milliseconds,
    chargeTime: Milliseconds,
  ) =>
  (route: Point[]) => {
    let totalTime = 0;
    let time = 0;

    for (let i = 0; i < route.length - 1; i++) {
      const from = route[i];
      const to = route[i + 1];
      const timeToNext = calculateTimeBetweenTwoPoints(from, to, speed);

      if (time + timeToNext > maxFlightTime) {
        totalTime += time + chargeTime;
        time = 0;
      } else {
        time += timeToNext;
      }
    }

    totalTime += time;
    return totalTime;
  };

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

  return inspectsAllPoints && startsAndEndsInBases;
}
