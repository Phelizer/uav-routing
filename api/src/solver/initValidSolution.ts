import { randomInt } from 'src/utils';
import { calculateTimeBetweenTwoPoints } from './calculateDistance';
import { KilometersPeHour, Milliseconds, Point, Solver } from './models';

export const initValidSolution: Solver = (
  pointsToObserve: Point[],
  startBase: Point,
  anotherBase: Point,
  chargeTime: Milliseconds,
  maxFlightTime: Milliseconds,
  speed: KilometersPeHour,
) => {
  return buildValidRoute(
    pointsToObserve,
    startBase,
    anotherBase,
    chargeTime,
    maxFlightTime,
    speed,
  );
};

function buildValidRoute(
  pointsToObserve: Point[],
  startBase: Point,
  anotherBase: Point,
  chargeTime: Milliseconds,
  maxFlightTime: Milliseconds,
  speed: KilometersPeHour,
) {
  const route: Point[] = [startBase];
  const bases = [startBase, anotherBase];
  let currentPoint = startBase;
  let unvisitedPoints = pointsToObserve;
  let restOfFlightTime = maxFlightTime;
  while (unvisitedPoints.length !== 0) {
    const { pointToPick, newRestOfFlightTime, newUnvisitedPoints } =
      findAvailablePoint(
        currentPoint,
        unvisitedPoints,
        bases,
        restOfFlightTime,
        speed,
        maxFlightTime,
      );

    route.push(pointToPick);
    currentPoint = pointToPick;
    restOfFlightTime = newRestOfFlightTime;
    unvisitedPoints = newUnvisitedPoints;
  }

  return route;
}

export function findAvailablePoint(
  currentPoint: Point,
  unvisitedPoints: Point[],
  bases: Point[],
  restOfFlightTime: Milliseconds,
  speed: KilometersPeHour,
  maxFlightTime: Milliseconds,
) {
  const availablePoints = unvisitedPoints.filter((point) =>
    isAvailablePoint(currentPoint, point, bases, restOfFlightTime, speed),
  );

  if (availablePoints.length === 0) {
    const availableBases = bases.filter((base) =>
      isAvailableBase(currentPoint, base, restOfFlightTime, speed),
    );

    let baseToPick = availableBases[randomInt(0, availableBases.length - 1)];
    if (bases.some((b) => b === currentPoint)) {
      baseToPick = availableBases.find(
        (base) => base !== currentPoint,
      ) as Point;
    }

    return {
      pointToPick: baseToPick,
      newRestOfFlightTime: maxFlightTime,
      newUnvisitedPoints: unvisitedPoints,
    };
  }

  const times = availablePoints.map((point) =>
    calculateTimeBetweenTwoPoints(currentPoint, point, speed),
  );

  const chances = calculateProbabilities(times);
  const indexOfPointToPick = determineOutcome(chances);
  const pointToPick = availablePoints[indexOfPointToPick];

  const newRestOfFlightTime = restOfFlightTime - times[indexOfPointToPick];
  const newUnvisitedPoints = unvisitedPoints.filter(
    (point) => point !== pointToPick,
  );

  return { pointToPick, newRestOfFlightTime, newUnvisitedPoints };
}

function isAvailablePoint(
  currentPoint: Point,
  anotherPoint: Point,
  bases: Point[],
  restOfFlightTime: Milliseconds,
  speed: KilometersPeHour,
): boolean {
  const forwardTime = calculateTimeBetweenTwoPoints(
    currentPoint,
    anotherPoint,
    speed,
  );

  const newRestOfFlightTime = restOfFlightTime - forwardTime;

  return (
    forwardTime < restOfFlightTime &&
    bases.some((base) =>
      isAvailableBase(anotherPoint, base, newRestOfFlightTime, speed),
    )
  );
}

function isAvailableBase(
  currentPoint: Point,
  base: Point,
  restOfFlightTime: Milliseconds,
  speed: KilometersPeHour,
): boolean {
  const forwardTime = calculateTimeBetweenTwoPoints(currentPoint, base, speed);

  if (forwardTime <= restOfFlightTime) {
    return true;
  }

  return false;
}

// TODO: rewrite
function calculateProbabilities(numbers: number[]): number[] {
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const probabilities = numbers.map((num) => num / sum);

  return probabilities;
}

// TODO: rewrite
function determineOutcome(probabilities: number[]): number {
  const random = Math.random();
  let cumulativeProbability = 0;

  for (let i = 0; i < probabilities.length; i++) {
    cumulativeProbability += probabilities[i];
    if (random <= cumulativeProbability) {
      return i;
    }
  }

  // If the loop ends without returning, there must be an error in the probabilities
  throw new Error('Invalid probabilities. The sum of probabilities must be 1.');
}
