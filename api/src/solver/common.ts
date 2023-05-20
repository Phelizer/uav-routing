import {
  calculateDistance,
  calculateTimeBetweenTwoPoints,
} from './calculateDistance';
import { KilometersPeHour, Milliseconds, Point } from './models';

// TODO: if bees algorithm uses getValidChanges_EXPERIMANTAL, not this one, then
// better to extract it to tabu search

export function swap(route: Point[], i: number, j: number): Point[] {
  const newArray = route.slice();
  [newArray[i], newArray[j]] = [newArray[j], newArray[i]];

  return newArray;
}

export function ejectBase(route: Point[], baseToEject: Point) {
  return route.filter((point) => point !== baseToEject);
}

export function changeBase(
  route: Point[],
  indexOfBaseToChange: number,
  replacement: Point,
) {
  const routeCopy = [...route];
  routeCopy[indexOfBaseToChange] = replacement;
  return routeCopy;
}

export const createCalculateTimeFitness = (
  speed: KilometersPeHour,
  maxFlightTime: Milliseconds,
  chargeTime: Milliseconds,
) => {
  const cache = new Map();

  return (route: Point[]) => {
    const idSignature = routeIdSignature(route);
    if (cache.has(idSignature)) {
      return cache.get(idSignature);
    }

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

    if (!cache.has(idSignature)) {
      cache.set(idSignature, totalTime);
    }

    return totalTime;
  };
};

function routeIdSignature(route: Point[]) {
  return route.map(({ id }) => id).join('&');
}

// not described yet:
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
  const startsWithBase = route[0].isBase;
  const endsWithBase = route[route.length - 1].isBase;

  return startsWithBase && endsWithBase;
}

function routeStartsAtStartBase(route: Point[]): boolean {
  return route[0].isStartBase;
}

// end of not described block

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
    if (route[i].isBase) {
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
  const startsAtStartBase = routeStartsAtStartBase(route);

  return inspectsAllPoints && startsAndEndsInBases && startsAtStartBase;
}

export function getKNearestPoints(point: Point, allPoints: Point[], k: number) {
  const numOfPoints = Math.ceil(allPoints.length * k);
  const distancesWithIndexes = allPoints
    .map((p, i) => {
      if (p === point) return null;
      return { distance: calculateDistance(point, p), i };
    })
    .filter((v): v is Exclude<typeof v, null> => v !== null);

  const ascendingSorted = distancesWithIndexes.sort(
    (a, b) => a.distance - b.distance,
  );

  const nearestIndexes = ascendingSorted
    .slice(0, numOfPoints)
    .map(({ i }) => i);
  // const nearestIndexes = distancesWithIndexes
  //   .slice(0, numOfPoints)
  //   .map(({ i }) => i);

  return allPoints.filter((_, i) => nearestIndexes.includes(i));
}
