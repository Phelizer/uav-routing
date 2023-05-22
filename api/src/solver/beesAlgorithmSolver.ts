import { randomlyReplaceArrayElements } from 'src/utils';
import { calculateDistance } from './calculateDistance';
import {
  changeBase,
  createCalculateTimeFitness,
  ejectBase,
  getKNearestPoints,
  isValidRoute,
  swap,
} from './common';
import { buildValidRoute } from './initValidSolution';
import { KilometersPeHour, Milliseconds, Point } from './models';
import { getValidChanges } from './tabuSolver';

// const partOfNearestPoints = 0.25;

export interface BeesAlgorithmParameters {
  solutionPopulationSize: number;
  numberOfBestSolutions: number;
  maxOfIterWithoutImpr: number;
}

export const createBeesAlgorithmSolver =
  (parameters: BeesAlgorithmParameters) =>
  (
    pointsToObserve: Point[],
    startBase: Point,
    anotherBase: Point,
    chargeTime: Milliseconds,
    maxFlightTime: Milliseconds,
    speed: KilometersPeHour,
  ) => {
    const {
      maxOfIterWithoutImpr,
      numberOfBestSolutions,
      solutionPopulationSize,
    } = parameters;

    const allBases = [startBase, anotherBase];
    const evaluate = createCalculateTimeFitness(
      speed,
      maxFlightTime,
      chargeTime,
    );

    const valid = (sol: Point[]) =>
      isValidRoute(sol, maxFlightTime, speed, pointsToObserve);

    let solutionPopulation: Point[][] = [];
    for (let i = 0; i < solutionPopulationSize; i++) {
      const { route } = buildValidRoute(
        pointsToObserve,
        startBase,
        anotherBase,
        chargeTime,
        maxFlightTime,
        speed,
      );

      solutionPopulation.push(route);
    }

    const sortCallback = (a: Point[], b: Point[]) => evaluate(a) - evaluate(b);
    solutionPopulation.sort(sortCallback);

    let recordSol: Point[] = solutionPopulation[0];
    let recordEvaluation = evaluate(recordSol);
    let itersWithoutImprx = 0;

    // const nearestPointsMapping = new Map<Point, Point[]>();
    // const allPoints = [...pointsToObserve, ...allBases];
    // for (const point of allPoints) {
    //   nearestPointsMapping.set(
    //     point,
    //     getKNearestPoints(point, allPoints, partOfNearestPoints),
    //   );
    // }

    while (itersWithoutImprx < maxOfIterWithoutImpr) {
      const allLocalOptimizationSols: Point[][] = [];

      // local optimization
      let betterSolFound = false;
      const topSols = solutionPopulation.slice(0, numberOfBestSolutions);
      for (const perspectiveSol of topSols) {
        // const nearestSols = getValidChanges(
        //   perspectiveSol,
        //   nearestPointsMapping,
        //   valid,
        //   allBases,
        // );

        // const nearestSols = getPossiblePermutations(
        //   perspectiveSol,
        //   valid,
        //   allBases,
        // );

        const nearestSols = getValidChanges(perspectiveSol, valid, allBases);

        allLocalOptimizationSols.push(...nearestSols);
        for (const nearestSol of nearestSols) {
          const evaluation = evaluate(nearestSol);
          if (evaluation < recordEvaluation) {
            recordSol = nearestSol;
            recordEvaluation = evaluation;
            betterSolFound = true;
          }
        }

        // update solutions
        solutionPopulation = [
          ...solutionPopulation,
          ...allLocalOptimizationSols,
        ]
          .sort(sortCallback)
          .slice(0, solutionPopulationSize);
      }

      // breeding
      const pairedSols = pairs(solutionPopulation);
      const descendants: Point[][] = [];
      for (const [route1, route2] of pairedSols) {
        // const newDescendants = getDescendants(route1, route2, valid);
        const newDescendants = getDescendants(route1, route2, valid);

        descendants.push(...newDescendants);
      }

      for (const descendant of descendants) {
        const evaluation = evaluate(descendant);
        if (evaluation < recordEvaluation) {
          recordSol = descendant;
          recordEvaluation = evaluation;
          betterSolFound = true;
        }
      }

      // update solutions
      solutionPopulation = [...solutionPopulation, ...descendants]
        .sort(sortCallback)
        .slice(0, solutionPopulationSize);

      if (betterSolFound) {
        itersWithoutImprx = 0;
      } else {
        itersWithoutImprx++;
      }
    }

    return { route: recordSol, fitness: recordEvaluation };
  };

function pairs(sols: Point[][]) {
  const paired: [Point[], Point[]][] = [];
  let indexes = sols.map((s, i) => i);
  for (let i = 0; i < maxEvenNumber(indexes.length) / 2; i++) {
    const firstIndex = indexes[rand(0, indexes.length)];
    indexes = indexes.filter((ind) => ind !== firstIndex);
    const secondIndex = indexes[rand(0, indexes.length)];
    indexes = indexes.filter((ind) => ind !== secondIndex);
    paired.push([sols[firstIndex], sols[secondIndex]]);
  }

  return paired;
}

function maxEvenNumber(number: number) {
  if (number % 2 === 0) {
    return number;
  }

  return number - 1;
}

function rand(minimum: number, maximum: number) {
  return Math.floor(Math.random() * (maximum - minimum)) + minimum;
}

// function getPossiblePermutations(
//   route: Point[],
//   nearestPointsMapping: Map<Point, Point[]>,
//   valid: (route: Point[]) => boolean,
//   bases: Point[],
// ) {
//   const cap = 15;
//   const newSols: Point[][] = [];
//   const routeIndexes = route.map((_, i) => i);
//   const shuffledIndexes = randomlyReplaceArrayElements(routeIndexes);
//   for (const i of shuffledIndexes) {
//     const point = route[i];
//     const nearest = nearestPointsMapping.get(point) ?? [];
//     // swaps
//     for (const nearPoint of nearest) {
//       if (!nearPoint.isBase) {
//         const indexOfNearest = route.findIndex((p) => p === nearPoint);
//         const newSol = swap(route, i, indexOfNearest);
//         if (valid(newSol)) {
//           newSols.push(newSol);
//           //:
//           if (newSols.length >= cap) {
//             return newSols;
//           }
//         }
//       }
//     }

//     if (point.isBase) {
//       // base removal
//       const newRemovalSol = ejectBase(route, point);
//       if (valid(newRemovalSol)) {
//         newSols.push(newRemovalSol);
//       }

//       //:
//       if (newSols.length >= cap) {
//         return newSols;
//       }

//       // base change
//       const newBase = bases.find((b) => b !== point) as Point;
//       const newChangeSol = changeBase(route, i, newBase);
//       if (valid(newChangeSol)) {
//         newSols.push(newChangeSol);
//       }

//       //:
//       if (newSols.length >= cap) {
//         return newSols;
//       }
//     }
//   }

//   return newSols;
// }

// function getDescendants(
//   route1: Point[],
//   route2: Point[],
//   valid: (route: Point[]) => boolean,
// ) {
//   const newSols: Point[][] = [];
//   for (const [point1IndexAtFirstRoute, point1] of route1.entries()) {
//     for (const [point2IndexAtSecondRoute, point2] of route2.entries()) {
//       if (!point1.isBase && !point2.isBase) {
//         const point1IndexAtSecondRoute = route2.findIndex((p) => p === point1);
//         const point2IndexAtFirstRoute = route1.findIndex((p) => p === point2);

//         const firstDescendant = swap(
//           route1,
//           point1IndexAtFirstRoute,
//           point2IndexAtFirstRoute,
//         );

//         const secondDescendant = swap(
//           route2,
//           point1IndexAtSecondRoute,
//           point2IndexAtSecondRoute,
//         );

//         if (valid(firstDescendant)) {
//           newSols.push(firstDescendant);
//         }

//         if (valid(secondDescendant)) {
//           newSols.push(secondDescendant);
//         }
//       }
//     }
//   }

//   return newSols;
// }

function getDescendants(
  route1: Point[],
  route2: Point[],
  valid: (route: Point[]) => boolean,
) {
  const cap = 50;
  const newSols: Point[][] = [];
  const indexesOfFirstRoute = route1.map((_, i) => i);
  const indexesOfSecondRoute = route2.map((_, i) => i);

  const shuffledIndexesOfFirstRoute =
    randomlyReplaceArrayElements(indexesOfFirstRoute);

  const shuffledIndexesOfSecondRoute =
    randomlyReplaceArrayElements(indexesOfSecondRoute);

  for (const point1IndexAtFirstRoute of shuffledIndexesOfFirstRoute) {
    const point1 = route1[point1IndexAtFirstRoute];
    for (const point2IndexAtSecondRoute of shuffledIndexesOfSecondRoute) {
      const point2 = route2[point2IndexAtSecondRoute];
      if (!point1.isBase && !point2.isBase) {
        const point1IndexAtSecondRoute = route2.findIndex((p) => p === point1);
        const point2IndexAtFirstRoute = route1.findIndex((p) => p === point2);

        const firstDescendant = swap(
          route1,
          point1IndexAtFirstRoute,
          point2IndexAtFirstRoute,
        );

        const secondDescendant = swap(
          route2,
          point1IndexAtSecondRoute,
          point2IndexAtSecondRoute,
        );

        if (valid(firstDescendant)) {
          newSols.push(firstDescendant);
          //:
          if (newSols.length >= cap) {
            return newSols;
          }
        }

        if (valid(secondDescendant)) {
          newSols.push(secondDescendant);
          //:
          if (newSols.length >= cap) {
            return newSols;
          }
        }
      }
    }
  }

  return newSols;
}
