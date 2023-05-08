import { Injectable } from '@nestjs/common';
import {
  AlgorithmName,
  CalculateRouteInputData,
  KilometersPeHour,
  Milliseconds,
  PerformExperimentInputData,
  Point,
  Result,
  Solver,
} from './models';
import * as fs from 'fs-extra';
import {
  TabuParams,
  createCalculateStopsFitness,
  createCalculateTimeFitness,
  createTabuSolver,
} from './tabuSolver';
import { AntColonyParams, createAntColonySolver } from './antColonySolver';
import {
  BeesAlgorithmParameters,
  createBeesAlgorithmSolver,
} from './beesAlgorithmSolver';
import { Square, generateProblem } from './generateRandomPoint';

@Injectable()
export class SolverService {
  private getTabuSolver() {
    const tabuParams: TabuParams = {
      maxIterationsWithoutImprovement: 30,
      numOfRuns: 10,
      tabuTenure: 10,
    };

    return createTabuSolver(tabuParams);
  }

  private getAntColonySolver() {
    const antColonyParams: AntColonyParams = {
      antsNumber: 15,
      evaporationRate: 0.2,
      heurInfoImportance: 0.5,
      pheromoneImportance: 0.5,
      maxIterationsWithoutImprovement: 30,
    };

    return createAntColonySolver(antColonyParams);
  }

  private getBeesAlgorithmSolver() {
    const beesAlgorithmParams: BeesAlgorithmParameters = {
      maxOfIterWithoutImpr: 30,
      numberOfBestSolutions: 10,
      solutionPopulationSize: 20,
    };

    const beesAlgorithmSolver = createBeesAlgorithmSolver(beesAlgorithmParams);
    return beesAlgorithmSolver;
  }

  private solver: Solver = this.getBeesAlgorithmSolver();
  setSolver = (algorithmName: AlgorithmName) => {
    this.solver = this.algorithmNameMapping[algorithmName];
  };

  private readonly algorithmNameMapping: Record<AlgorithmName, Solver> = {
    ants: this.getAntColonySolver(),
    bees: this.getBeesAlgorithmSolver(),
    tabu: this.getTabuSolver(),
  };

  calculateRoute({
    pointsToObserve,
    startBase,
    anotherBase,
    chargeTime,
    maxFlightTime,
    speed,
  }: CalculateRouteInputData): Result & Record<string, unknown> {
    const { points, bases }: { points: Point[]; bases: [Point, Point] } =
      JSON.parse(fs.readFileSync(__dirname + '/../../coords.json').toString());

    const shuffledPoints = this.randomlyReplaceArrayElements(points);
    const [startBase2, anotherBase2] = bases;
    const maxFlightTime2: Milliseconds = 120000;
    const speed2: KilometersPeHour = 30;
    const chargeTime2 = 60000;
    console.time('tabu');
    const { route, fitness } = this.solver(
      shuffledPoints,
      startBase2,
      anotherBase2,
      chargeTime2,
      maxFlightTime2,
      speed2,
    );
    console.timeEnd('tabu');
    const calcualteFitnessByStops = createCalculateStopsFitness(bases);
    const calculateFitnessByTime = createCalculateTimeFitness(
      speed2,
      maxFlightTime2,
      chargeTime2,
    );
    return {
      route,
      fitness,
      stops: calcualteFitnessByStops(route),
      totalTime: calculateFitnessByTime(route),
    };

    // const bases = [startBase, anotherBase];

    // const calcualteFitnessByStops = createCalculateStopsFitness(bases);
    // const calculateFitnessByTime = createCalculateTimeFitness(
    //   speed,
    //   maxFlightTime,
    //   chargeTime,
    // );

    // const { route, fitness } = this.solver(
    //   pointsToObserve,
    //   startBase,
    //   anotherBase,
    //   chargeTime,
    //   maxFlightTime,
    //   speed,
    // );

    // return {
    //   route,
    //   fitness,
    //   stops: calcualteFitnessByStops(route),
    //   totalTime: calculateFitnessByTime(route),
    // };
  }

  private readonly standardSquare: Square = {
    leftTopPoint: { lat: 50.53509088416523, lng: 30.36908789440387 },
    rightBottomPoint: { lat: 50.384682508571416, lng: 30.74135785432749 },
  };

  performExperiment({
    algorithm,
    numberOfPoints,
    numberOfRuns,
  }: PerformExperimentInputData) {
    this.setSolver(algorithm);
    const results: Result[] = [];
    for (let i = 0; i < numberOfRuns; i++) {
      const problem = generateProblem(this.standardSquare, numberOfPoints);
      results.push(this.solver(...problem));
    }

    return results;
  }

  private randomlyReplaceArrayElements<T>(array: T[]): T[] {
    const newArray: T[] = [...array];

    for (let i = 0; i < newArray.length; i++) {
      const randomIndex = Math.floor(Math.random() * newArray.length);
      const temp = newArray[i];
      newArray[i] = newArray[randomIndex];
      newArray[randomIndex] = temp;
    }

    return newArray;
  }
}
