import {
  changeBase,
  createCalculateTimeFitness,
  ejectBase,
  getKNearestPoints,
  isValidRoute,
  routeIdSignature,
  swap,
} from './common';
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
    speed: KilometersPeHour,
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

      let bestSolution = initialRoute;
      let bestSolutionFitness = calculateFitness(bestSolution);

      let bestCandidate = initialRoute;
      let bestCandidateFitness = calculateFitness(bestCandidate);

      const tabuList = new TabuList<string>(tabuTenure);
      tabuList.append(routeIdSignature(initialRoute));

      let iterationsWithoutImprovement = 0;

      while (iterationsWithoutImprovement < maxIterationsWithoutImprovement) {
        const neighbors = getValidChanges(
          bestCandidate,
          closestPoints,
          isValid,
          bases,
        );

        bestCandidate = neighbors[0];
        bestCandidateFitness = calculateFitness(bestCandidate);

        for (const candidate of neighbors) {
          const candidateFitness = calculateFitness(candidate);
          if (
            !tabuList.has(routeIdSignature(candidate)) &&
            candidateFitness < calculateFitness(bestCandidate)
          ) {
            bestCandidate = candidate;
            bestCandidateFitness = candidateFitness;
          }
        }

        if (bestCandidateFitness < bestSolutionFitness) {
          bestSolution = bestCandidate;
          bestSolutionFitness = bestCandidateFitness;
          iterationsWithoutImprovement = 0;
        } else {
          iterationsWithoutImprovement++;
        }

        tabuList.append(routeIdSignature(bestCandidate));
      }

      const bestSolutionOfThisRun = {
        route: bestSolution,
        fitness: bestSolutionFitness,
      };

      besSolutionsByRuns.push(bestSolutionOfThisRun);
    }

    const bestSolutionEver = besSolutionsByRuns.reduce((best, curr) =>
      curr.fitness < best.fitness ? curr : best,
    );

    return bestSolutionEver;
  };

// function generateNeighbors(
//   isValid: (route: Point[]) => boolean,
//   source: Point[],
//   bases: Point[],
// ) {
//   const swapNeighbors = generateSwapNeighbors(isValid, source);
//   const baseChangeIndexes = getAvailableBaseChanges(isValid, source, bases);
//   const baseChangeNeighbors: Point[][] = [];
//   for (const availableBaseIndex of baseChangeIndexes) {
//     const baseToChange = source[availableBaseIndex];
//     const anotherBase = getOppositeBase(bases, baseToChange);
//     baseChangeNeighbors.push(
//       changeBase(source, availableBaseIndex, anotherBase),
//     );
//   }

//   const ejectBaseNeighbors = generateEjectBaseNeighbors(isValid, source, bases);

//   return [...swapNeighbors, ...baseChangeNeighbors, ...ejectBaseNeighbors];
// }

// function generateEjectBaseNeighbors(
//   isValid: (route: Point[]) => boolean,
//   source: Point[],
//   bases: Point[],
// ) {
//   const neighbors: Point[][] = [];
//   for (const point of source) {
//     if (isBase(bases, point)) {
//       const routeWithEjectedBase = ejectBase(source, point);
//       if (isValid(routeWithEjectedBase)) {
//         neighbors.push(routeWithEjectedBase);
//       }
//     }
//   }

//   return neighbors;
// }

// function generateSwapNeighbors(
//   isValid: (route: Point[]) => boolean,
//   source: Point[],
// ) {
//   const neighbors: Point[][] = [];
//   // this can be extracted, calculated one time and reused to avoid
//   // unnecessary recalculations. Or can make this function memoizable

//   for (let i = 0; i < source.length; i++) {
//     const availablePartnerIndexes = getAvailableSwapPartnerIndexes(
//       isValid,
//       source,
//       i,
//     );

//     for (const partI of availablePartnerIndexes) {
//       neighbors.push(swap(source, i, partI));
//     }
//   }

//   return neighbors;
// }

// function getAvailableSwapPartnerIndexes(
//   isValid: (route: Point[]) => boolean,
//   route: Point[],
//   indexOfPointToSwap: number,
// ) {
//   const availablePartnersIndexes: number[] = [];
//   for (let partnerIndex = 0; partnerIndex < route.length; partnerIndex++) {
//     const isSelf = partnerIndex === indexOfPointToSwap;
//     const isValidNeighbor = isValid(
//       swap(route, indexOfPointToSwap, partnerIndex),
//     );

//     if (isValidNeighbor && !isSelf) {
//       availablePartnersIndexes.push(partnerIndex);
//     }
//   }

//   return availablePartnersIndexes;
// }

function isBase(bases: Point[], point: Point) {
  return bases.includes(point);
}

// function getAvailableBaseChanges(
//   isValid: (route: Point[]) => boolean,
//   route: Point[],
//   bases: Point[],
// ) {
//   const availableBaseChanges: number[] = [];
//   for (const [i, elem] of route.entries()) {
//     if (isBase(bases, elem)) {
//       const anotherBase = getOppositeBase(bases, elem);
//       if (isValid(changeBase(route, i, anotherBase))) {
//         availableBaseChanges.push(i);
//       }
//     }
//   }

//   return availableBaseChanges;
// }

// function getOppositeBase(bases: Point[], baseToChange: Point) {
//   return bases.find((base) => base !== baseToChange) as Point;
// }

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

export function getValidChanges(
  route: Point[],
  nearestPointsMapping: Map<Point, Point[]>,
  valid: (route: Point[]) => boolean,
  bases: Point[],
) {
  const newSols: Point[][] = [];
  for (const [i, point] of route.entries()) {
    const nearest = nearestPointsMapping.get(point) ?? [];
    // swaps
    for (const nearPoint of nearest) {
      if (!nearPoint.isBase) {
        const indexOfNearest = route.findIndex((p) => p === nearPoint);
        const newSol = swap(route, i, indexOfNearest);
        if (valid(newSol)) {
          newSols.push(newSol);
        }
      }
    }

    if (point.isBase) {
      // base removal
      const newRemovalSol = ejectBase(route, point);
      if (valid(newRemovalSol)) {
        newSols.push(newRemovalSol);
      }

      // base change
      const newBase = bases.find((b) => b !== point) as Point;
      const newChangeSol = changeBase(route, i, newBase);
      if (valid(newChangeSol)) {
        newSols.push(newChangeSol);
      }
    }
  }

  return newSols;
}
