import { calculateTimeBetweenTwoPoints } from './calculateDistance';
import { createCalculateTimeFitness, isValidRoute } from './common';
import {
  determineOutcome,
  isAvailableBase,
  isAvailablePoint,
} from './initValidSolution';
import { KilometersPeHour, Milliseconds, Point, Solver } from './models';

export interface AntColonyParams {
  antsNumber: number;
  maxIterationsWithoutImprovement: number;
  evaporationRate: number;
  pheromoneImportance: number;
  heurInfoImportance: number;
}

interface CreateAntColonySolver {
  (params: AntColonyParams): Solver;
}

export const createAntColonySolver: CreateAntColonySolver =
  (params: AntColonyParams) =>
  (
    pointsToObserve: Point[],
    startBase: Point,
    anotherBase: Point,
    chargeTime: Milliseconds,
    maxFlightTime: Milliseconds,
    speed: KilometersPeHour,
  ) => {
    const bases = [startBase, anotherBase];
    const isValid = (route: Point[]) =>
      isValidRoute(route, maxFlightTime, speed, pointsToObserve);

    const calculateFitness = createCalculateTimeFitness(
      speed,
      maxFlightTime,
      chargeTime,
    );

    const {
      antsNumber,
      evaporationRate,
      heurInfoImportance,
      maxIterationsWithoutImprovement,
      pheromoneImportance,
    } = params;

    const pheromoneState = new PheromoneState(
      pointsToObserve,
      bases,
      evaporationRate,
      0.1,
    );

    // const calculateProbability = createCalculateProbability(
    //   pheromoneState,
    //   pheromoneImportance,
    //   heurInfoImportance,
    //   calculateFitness,
    // );

    const timeToNext = (p1: Point, p2: Point) =>
      calculateTimeBetweenTwoPoints(p1, p2, speed);

    const capculateProbability_experimental = createCalculateProbability(
      pheromoneState,
      pheromoneImportance,
      heurInfoImportance,
      timeToNext,
    );

    const bestSolutionsByAnts: Point[][] = [];

    let iterationsWithoutImprovement = 0;
    let bestEstimation = Infinity;
    let bestSolution = null as unknown as Point[];
    while (iterationsWithoutImprovement < maxIterationsWithoutImprovement) {
      let wasBestSolUpdated = false;
      for (let numOfAnt = 0; numOfAnt < antsNumber; numOfAnt++) {
        const currentRoute: Point[] = [startBase];

        let restOfPointToObserve = [...pointsToObserve];
        let restOfFlightTime = maxFlightTime;
        while (
          restOfPointToObserve.length > 0 ||
          (restOfPointToObserve.length === 0 &&
            !currentRoute[currentRoute.length - 1].isBase)
        ) {
          const lastPoint = currentRoute[currentRoute.length - 1];
          const availablePoints = getAvailableMoves(
            lastPoint,
            restOfPointToObserve,
            bases,
            restOfFlightTime,
            speed,
          );

          const probabilities = availablePoints.map((point) =>
            capculateProbability_experimental(currentRoute, point),
          );

          const normalizedProbs = normProbs(probabilities);
          const randomIndex = determineOutcome(normalizedProbs);
          const nextPoint = availablePoints[randomIndex];
          currentRoute.push(nextPoint);
          restOfPointToObserve = restOfPointToObserve.filter(
            (p) => p !== nextPoint,
          );

          if (nextPoint.isBase) {
            restOfFlightTime = maxFlightTime;
          } else {
            restOfFlightTime -= calculateTimeBetweenTwoPoints(
              lastPoint,
              nextPoint,
              speed,
            );
          }
        }

        const estimation = calculateFitness(currentRoute);

        if (estimation < bestEstimation) {
          bestSolution = currentRoute;
          bestEstimation = estimation;
          wasBestSolUpdated = true;
        }

        const currentAntBestSolution = bestSolutionsByAnts[numOfAnt];
        if (
          !currentAntBestSolution ||
          calculateFitness(currentAntBestSolution) >
            calculateFitness(currentRoute)
        ) {
          bestSolutionsByAnts[numOfAnt] = currentRoute;
        }

        // currentIterationSolutions.push(currentRoute);

        // antsSolutions.push(currentRoute);
      }

      pheromoneState.evaporateAll();

      // for (let numOfAnt = 0; numOfAnt < antsNumber; numOfAnt++) {
      //   const sol = antsSolutions[numOfAnt];
      //   const estimation = calculateFitness(sol);
      //   for (let i = 0; i < sol.length - 2; i++) {
      //     const curr = sol[i];
      //     const next = sol[i + 1];
      //     pheromoneState.add(curr, next, estimation);
      //   }
      // }

      for (const antSolution of bestSolutionsByAnts) {
        for (let i = 0; i < antSolution.length - 2; i++) {
          const curr = antSolution[i];
          const next = antSolution[i + 1];
          pheromoneState.add(curr, next, calculateFitness(antSolution));
        }
      }

      if (wasBestSolUpdated) {
        iterationsWithoutImprovement = 0;
      } else {
        iterationsWithoutImprovement++;
      }
    }

    return { route: bestSolution, fitness: bestEstimation };
  };

function normProbs(probabilities: number[]) {
  const sumOfProbs = probabilities.reduce((sum, p) => sum + p, 0);
  return probabilities.map((p) => p / sumOfProbs);
}

// OLD VERSION:
// const createCalculateProbability =
//   (
//     pherState: PheromoneState,
//     pheromoneImportance: number,
//     heurInfoImportance: number,
//     calcFitness: (route: Point[]) => number,
//   ) =>
//   (currentRoute: Point[], nextPoint: Point) => {
//     const currentPoint = currentRoute[currentRoute.length - 1];
//     const estimation = calcFitness([...currentRoute, nextPoint]) || 1;

//     return (
//       Math.pow(pherState.get(currentPoint, nextPoint), pheromoneImportance) *
//       Math.pow(estimation, heurInfoImportance)
//     );
//   };

const createCalculateProbability =
  (
    pherState: PheromoneState,
    pheromoneImportance: number,
    heurInfoImportance: number,
    calTimeBetweenTwoPoints: (p1: Point, p2: Point) => number,
  ) =>
  (currentRoute: Point[], nextPoint: Point) => {
    const currentPoint = currentRoute[currentRoute.length - 1];
    const estimation = calTimeBetweenTwoPoints(currentPoint, nextPoint);
    const res =
      Math.pow(pherState.get(currentPoint, nextPoint), pheromoneImportance) *
      Math.pow(1 / estimation, heurInfoImportance);

    return res;
  };

function getAvailableMoves(
  currentPoint: Point,
  restOfPointToObserve: Point[],
  bases: Point[],
  restOfFlightTime: number,
  speed: number,
) {
  const availablePoints: Point[] = [];
  for (const point of restOfPointToObserve) {
    if (isAvailablePoint(currentPoint, point, bases, restOfFlightTime, speed)) {
      availablePoints.push(point);
    }
  }

  if (availablePoints.length > 0) {
    return availablePoints;
  }

  const availableBases: Point[] = [];
  for (const base of bases) {
    if (isAvailableBase(currentPoint, base, restOfFlightTime, speed)) {
      availableBases.push(base);
    }
  }

  return availableBases;
}

class PheromoneState {
  private pheromones = new Map();

  constructor(
    private readonly points: Point[],
    private readonly bases: Point[],
    private readonly evaporationRate: number,
    initialPheromoneVal: number,
  ) {
    const allPoints = [...this.points, ...this.bases];
    for (let i = 0; i < allPoints.length; i++) {
      for (let j = 0; j < allPoints.length; j++) {
        const point1 = allPoints[i];
        const point2 = allPoints[j];
        const key = this.getKey(point1, point2);
        this.pheromones.set(key, initialPheromoneVal);
      }
    }
  }

  // MAKING obj1-obj2 and obj2-obj1 the same key can improve the algo
  private getKey(point1: Point, point2: Point) {
    const minID = Math.min(point1.id, point2.id);
    const maxID = Math.max(point1.id, point2.id);
    return `${minID}&${maxID}`;
  }

  get(point1: Point, point2: Point) {
    const key = this.getKey(point1, point2);
    return this.pheromones.get(key);
  }

  private evaporate(point1: Point, point2: Point) {
    const key = this.getKey(point1, point2);
    const updatedValue = this.pheromones.get(key) * (1 - this.evaporationRate);
    this.pheromones.set(key, updatedValue);
  }

  evaporateAll() {
    const allPoints = [...this.points, ...this.bases];
    for (let i = 0; i < allPoints.length; i++) {
      for (let j = 0; j < allPoints.length; j++) {
        const point1 = allPoints[i];
        const point2 = allPoints[j];
        this.evaporate(point1, point2);
      }
    }
  }

  add(point1: Point, point2: Point, estimation: number) {
    const key = this.getKey(point1, point2);
    const updatedValue = this.pheromones.get(key) + 1 / estimation;
    this.pheromones.set(key, updatedValue);
  }
}
