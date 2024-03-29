import { randomInt } from 'src/utils';
import { calculateTimeBetweenTwoPoints } from './calculateDistance';
import { KilometersPeHour, Milliseconds, Point, Solver } from './models';
import { createCalculateTimeFitness } from './common';

// not described yet
function routeEndsInBase(bases: Point[], route: Point[]) {
  const lastPoint = route[route.length - 1];
  return bases.some((base) => lastPoint === base);
}
// end of not described block

export const buildValidRoute: Solver = (
  pointsToObserve: Point[],
  startBase: Point,
  anotherBase: Point,
  chargeTime: Milliseconds,
  maxFlightTime: Milliseconds,
  speed: KilometersPeHour,
) => {
  const route: Point[] = [startBase];
  const bases = [startBase, anotherBase];
  let currentPoint = startBase;
  let unvisitedPoints = pointsToObserve;
  let restOfFlightTime = maxFlightTime;
  do {
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
  } while (unvisitedPoints.length !== 0 || !routeEndsInBase(bases, route));

  const fitness = createCalculateTimeFitness(
    speed,
    maxFlightTime,
    chargeTime,
  )(route);

  return { route, fitness };
};

// not described yet
function findNearestBase(
  availableBases: Point[],
  currentPoint: Point,
  speed: Milliseconds,
) {
  return availableBases.reduce((nearestBase, currentBase) => {
    const minValue = calculateTimeBetweenTwoPoints(
      currentPoint,
      nearestBase,
      speed,
    );

    const currentValue = calculateTimeBetweenTwoPoints(
      currentPoint,
      currentBase,
      speed,
    );

    return currentValue < minValue ? currentBase : nearestBase;
  });
}
// end of not described block

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

  if (unvisitedPoints.length === 0) {
    const availableBases = bases.filter((base) =>
      isAvailableBase(currentPoint, base, restOfFlightTime, speed),
    );

    const finishBase = findNearestBase(availableBases, currentPoint, speed);

    return {
      pointToPick: finishBase,
      newRestOfFlightTime: maxFlightTime,
      newUnvisitedPoints: unvisitedPoints,
    };
  }

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

  const chances = calculateProbabilitiesV2(times);
  const indexOfPointToPick = determineOutcome(chances);
  const pointToPick = availablePoints[indexOfPointToPick];

  const newRestOfFlightTime = restOfFlightTime - times[indexOfPointToPick];
  const newUnvisitedPoints = unvisitedPoints.filter(
    (point) => point !== pointToPick,
  );

  return { pointToPick, newRestOfFlightTime, newUnvisitedPoints };
}

export function isAvailablePoint(
  currentPoint: Point,
  anotherPoint: Point,
  bases: Point[],
  restOfFlightTime: Milliseconds,
  speed: KilometersPeHour,
): boolean {
  if (currentPoint === anotherPoint) {
    return false;
  }

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

export function isAvailableBase(
  currentPoint: Point,
  base: Point,
  restOfFlightTime: Milliseconds,
  speed: KilometersPeHour,
): boolean {
  if (currentPoint === base) {
    return false;
  }

  const forwardTime = calculateTimeBetweenTwoPoints(currentPoint, base, speed);

  if (forwardTime <= restOfFlightTime) {
    return true;
  }

  return false;
}

// not described yet
// TODO: rewrite
// function calculateProbabilities(numbers: number[]): number[] {
//   const sum = numbers.reduce((acc, num) => acc + num, 0);
//   const probabilities = numbers.map((num) => num / sum);

//   return probabilities;
// }
// end of not described block

// not described yet
function calculateProbabilitiesV2(numbers: number[]): number[] {
  const max = numbers.reduce((a, b) => (a > b ? a : b));
  const probabilities = numbers.map((num) => max + 1 - num);

  return normalizeProbs(probabilities);
}

function normalizeProbs(numbers: number[]) {
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const normalized = numbers.map((num) => num / sum);
  return normalized;
}

// function sharpenProbabilities(probabilities: number[], amount: number) {
//   const sum = probabilities.reduce((acc, val) => acc + val, 0);
//   const average = sum / probabilities.length;
//   const scale = Math.pow(average, amount);
//   const sharpenedProbabilities = probabilities.map((p) => p * scale);
//   const normalizedProbabilities = sharpenedProbabilities.map((p) => p / sum);
//   return normalizedProbabilities;
// }

// end of not described block

// TODO: rewrite
export function determineOutcome(probabilities: number[]): number {
  const random = Math.random();
  let cumulativeProbability = 0;

  for (let i = 0; i < probabilities.length; i++) {
    cumulativeProbability += probabilities[i];
    if (random <= cumulativeProbability) {
      return i;
    }
  }

  const sum = probabilities.reduce((x, y) => x + y, 0);
  throw new Error(`The sum of chances should be 1. The sum is: ${sum}`);
}

// greedy algorithm

// TODO: remove
// NOT TO DOC
export const buildGreedyRoute: Solver = (
  pointsToObserve: Point[],
  startBase: Point,
  anotherBase: Point,
  chargeTime: Milliseconds,
  maxFlightTime: Milliseconds,
  speed: KilometersPeHour,
) => {
  const route: Point[] = [startBase];
  const bases = [startBase, anotherBase];
  let currentPoint = startBase;
  let unvisitedPoints = pointsToObserve;
  let restOfFlightTime = maxFlightTime;
  do {
    const { pointToPick, newRestOfFlightTime, newUnvisitedPoints } =
      findNearestAvailablePoint(
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
  } while (unvisitedPoints.length !== 0 || !routeEndsInBase(bases, route));

  const fitness = createCalculateTimeFitness(
    speed,
    maxFlightTime,
    chargeTime,
  )(route);

  return { route, fitness };
};

function findNearestAvailablePoint(
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

  if (unvisitedPoints.length === 0) {
    const availableBases = bases.filter((base) =>
      isAvailableBase(currentPoint, base, restOfFlightTime, speed),
    );

    const finishBase = findNearestBase(availableBases, currentPoint, speed);

    return {
      pointToPick: finishBase,
      newRestOfFlightTime: maxFlightTime,
      newUnvisitedPoints: unvisitedPoints,
    };
  }

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

  const { indexOfNearest } = times.reduce(
    (acc: { value: number; indexOfNearest: number }, curr, i) =>
      curr < acc.value ? { value: curr, indexOfNearest: i } : acc,
    { value: Infinity, indexOfNearest: 0 },
  );

  const pointToPick = availablePoints[indexOfNearest];

  const newRestOfFlightTime = restOfFlightTime - times[indexOfNearest];
  const newUnvisitedPoints = unvisitedPoints.filter(
    (point) => point !== pointToPick,
  );

  return { pointToPick, newRestOfFlightTime, newUnvisitedPoints };
}
