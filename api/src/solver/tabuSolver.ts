import { getKNearestPoints, getValidChanges } from './beesAlgorithmSolver';
import { calculateTimeBetweenTwoPoints } from './calculateDistance';
import { buildValidRoute } from './initValidSolution';
import {
  KilometersPeHour,
  Milliseconds,
  Point,
  Solution,
  Solver,
} from './models';

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

export interface TabuParams {
  maxIterationsWithoutImprovement: number;
  numOfRuns: number;
  tabuTenure: number;
}

interface CreateTabuSolver {
  (params: TabuParams): Solver;
}

export const createTabuSolver: CreateTabuSolver =
  (params: TabuParams) =>
  (
    pointsToObserve: Point[],
    startBase: Point,
    anotherBase: Point,
    chargeTime: Milliseconds,
    maxFlightTime: Milliseconds,
    speed: Milliseconds,
  ) => {
    const { maxIterationsWithoutImprovement, numOfRuns, tabuTenure } = params;
    const bases = [startBase, anotherBase];
    const isValid = (route: Point[]) =>
      isValidRoute(route, maxFlightTime, speed, pointsToObserve);

    const calculateFitness = createCalculateTimeFitness(
      speed,
      maxFlightTime,
      chargeTime,
    );

    // const calculateFitness = createCalculateStopsFitness(bases);

    const closestPoints = new Map<Point, Point[]>();
    for (const point of pointsToObserve) {
      closestPoints.set(point, getKNearestPoints(point, pointsToObserve, 0.25));
    }

    const besSolutionsByRuns: Solution[] = [];

    for (let runNumber = 0; runNumber < numOfRuns; runNumber++) {
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

      const tabuList = new TabuList<string>(tabuTenure);
      let iterationsWithoutImprovement = 0;
      while (iterationsWithoutImprovement < maxIterationsWithoutImprovement) {
        let currentSolution = bestSolution;
        let currentFitness = bestFitness;
        let isThereFoundNeighborhood = false;

        // const neighbors = generateNeighbors(isValid, currentSolution, bases);
        const neighbors = getValidChanges(
          currentSolution,
          closestPoints,
          isValid,
          bases,
        );

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
          iterationsWithoutImprovement = 0;
        } else {
          iterationsWithoutImprovement++;
        }
      }

      const bestSolutionOfThisRun = {
        route: bestSolution,
        fitness: bestFitness,
      };

      besSolutionsByRuns.push(bestSolutionOfThisRun);
    }

    const bestSolutionEver = besSolutionsByRuns.reduce((best, curr) =>
      curr.fitness < best.fitness ? curr : best,
    );

    return bestSolutionEver;
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

  const ejectBaseNeighbors = generateEjectBaseNeighbors(isValid, source, bases);

  return [...swapNeighbors, ...baseChangeNeighbors, ...ejectBaseNeighbors];
}

function generateEjectBaseNeighbors(
  isValid: (route: Point[]) => boolean,
  source: Point[],
  bases: Point[],
) {
  const neighbors: Point[][] = [];
  for (const point of source) {
    if (isBase(bases, point)) {
      const routeWithEjectedBase = ejectBase(source, point);
      if (isValid(routeWithEjectedBase)) {
        neighbors.push(routeWithEjectedBase);
      }
    }
  }

  return neighbors;
}

export function ejectBase(route: Point[], baseToEject: Point) {
  return route.filter((point) => point !== baseToEject);
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

export function changeBase(
  route: Point[],
  indexOfBaseToChange: number,
  replacement: Point,
) {
  const routeCopy = [...route];
  routeCopy[indexOfBaseToChange] = replacement;
  return routeCopy;
}

export function swap(route: Point[], i: number, j: number): Point[] {
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

export const createCalculateStopsFitness =
  (bases: Point[]) => (route: Point[]) => {
    return route
      .slice(1, -1)
      .reduce(
        (baseCounter, currPoint) =>
          isBase(bases, currPoint) ? baseCounter + 1 : baseCounter,
        0,
      );
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

  return inspectsAllPoints && startsAndEndsInBases;
}
