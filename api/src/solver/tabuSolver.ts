import { calculateTimeBetweenTwoPoints } from './calculateDistance';
import { buildValidRoute } from './initValidSolution';
import { KilometersPeHour, Milliseconds, Point, Solver } from './models';

class TabuList<T> {
  constructor(private readonly tenure: number) {}

  private list: T[] = [];

  has = (elem: T) => {
    return this.list.includes(elem);
  };

  append = (elem: T) => {
    this.list.push(elem);
    if (this.list.length > this.tenure) {
      this.list.shift();
    }
  };
}

export const tabuSolver: Solver = (
  pointsToObserve: Point[],
  startBase: Point,
  anotherBase: Point,
  chargeTime: Milliseconds,
  maxFlightTime: Milliseconds,
  speed: Milliseconds,
) => {
  const bases = [startBase, anotherBase];
  const isValid = (route: Point[]) =>
    isValidRoute(route, maxFlightTime, speed, pointsToObserve);

  const calculateFitness = createCalculateTimeFitness(
    speed,
    maxFlightTime,
    chargeTime,
  );

  const { route: initialRoute, fitness: initialFitness } = buildValidRoute(
    pointsToObserve,
    startBase,
    anotherBase,
    chargeTime,
    maxFlightTime,
    speed,
  );

  console.log('INITIAL FITNESS:', initialFitness);

  let bestSolution = initialRoute;

  let bestFitness = calculateFitness(bestSolution);

  const tabuList = new TabuList<string>(10);
  const maxIterations = 1000;

  for (let i = 0; i < maxIterations; i++) {
    let currentSolution = bestSolution;
    let currentFitness = bestFitness;
    let isThereFoundNeighborhood = false;

    const neighbors = generateNeighbors(isValid, currentSolution, bases);
    for (const neigh of neighbors) {
      const neighborFitness = calculateFitness(neigh);
      const str = JSON.stringify(neigh);
      if (!tabuList.has(str) || neighborFitness < bestFitness) {
        if (neighborFitness < currentFitness) {
          currentSolution = neigh;
          currentFitness = neighborFitness;
          isThereFoundNeighborhood = true;
        }
      }
    }

    if (isThereFoundNeighborhood) {
      bestSolution = currentSolution;
      bestFitness = currentFitness;
      const str = JSON.stringify(currentSolution);
      tabuList.append(str);
    }
  }

  return { route: bestSolution, fitness: bestFitness };
};

function generateNeighbors(
  isValid: (route: Point[]) => boolean,
  source: Point[],
  bases: Point[],
) {
  const swapNeighbors = generateSwapNeighbors(isValid, source);
  const baseChangeIndexes = getAvailableBaseChanges(isValid, source, bases);
  const baseChangeNeighbors: Point[][] = [];
  for (const availableBaseIndex of baseChangeIndexes) {
    const baseToChange = source[availableBaseIndex];
    const anotherBase = getOppositeBase(bases, baseToChange);
    baseChangeNeighbors.push(
      changeBase(source, availableBaseIndex, anotherBase),
    );
  }

  return [...swapNeighbors, ...baseChangeNeighbors];
}

function generateSwapNeighbors(
  isValid: (route: Point[]) => boolean,
  source: Point[],
) {
  const neighbors: Point[][] = [];
  // this can be extracted, calculated one time and reused to avoid
  // unnecessary recalculations. Or can make this function memoizable

  for (let i = 0; i < source.length; i++) {
    const availablePartnerIndexes = getAvailableSwapPartnerIndexes(
      isValid,
      source,
      i,
    );

    for (const partI of availablePartnerIndexes) {
      neighbors.push(swap(source, i, partI));
    }
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

function isBase(bases: Point[], point: Point) {
  return bases.includes(point);
}

function getAvailableBaseChanges(
  isValid: (route: Point[]) => boolean,
  route: Point[],
  bases: Point[],
) {
  const availableBaseChanges: number[] = [];
  for (const [i, elem] of route.entries()) {
    if (isBase(bases, elem)) {
      const anotherBase = getOppositeBase(bases, elem);
      if (isValid(changeBase(route, i, anotherBase))) {
        availableBaseChanges.push(i);
      }
    }
  }

  return availableBaseChanges;
}

function getOppositeBase(bases: Point[], baseToChange: Point) {
  return bases.find((base) => base !== baseToChange) as Point;
}

function changeBase(
  route: Point[],
  indexOfBaseToChange: number,
  replacement: Point,
) {
  const routeCopy = [...route];
  routeCopy[indexOfBaseToChange] = replacement;
  return routeCopy;
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
