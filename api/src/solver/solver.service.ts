import { HttpException, Injectable, StreamableFile } from '@nestjs/common';
import {
  AlgorithmName,
  CalculateRouteInputData,
  KilometersPeHour,
  Milliseconds,
  PerformExperimentInputData,
  Point,
  Result,
  Solution,
  Solver,
} from './models';
import * as fs from 'fs-extra';
import {
  TabuParams,
  createCalculateStopsFitness,
  createTabuSolver,
} from './tabuSolver';
import { AntColonyParams, createAntColonySolver } from './antColonySolver';
import {
  BeesAlgorithmParameters,
  createBeesAlgorithmSolver,
} from './beesAlgorithmSolver';
import { Square, generateProblem } from './generateRandomPoint';
import { buildGreedyRoute, buildValidRoute } from './initValidSolution';
import { createCalculateTimeFitness } from './common';
import { User } from 'src/users/users.service';
import { join } from 'path';
import { randomlyReplaceArrayElements } from 'src/utils';
import * as R from 'ramda';

interface ExperimentResultForDownload extends PerformExperimentInputData {
  mean: number;
  standardDeviation: number;
}

@Injectable()
export class SolverService {
  private getTabuSolver() {
    const tabuParams: TabuParams = {
      maxIterationsWithoutImprovement: 10,
      numOfRuns: 30,
      tabuTenure: 100,
    };

    return createTabuSolver(tabuParams);
  }

  private getAntColonySolver() {
    const antColonyParams: AntColonyParams = {
      antsNumber: 15,
      evaporationRate: 0.1,
      heurInfoImportance: 0.5,
      pheromoneImportance: 5,
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

  private readonly algorithmNameMapping: Record<AlgorithmName, Solver> = {
    ants: this.getAntColonySolver(),
    bees: this.getBeesAlgorithmSolver(),
    tabu: this.getTabuSolver(),
  };

  calculateRoute(
    inputData: CalculateRouteInputData,
    user: User,
  ): Result & Record<string, unknown> {
    const {
      pointsToObserve,
      startBase,
      anotherBase,
      chargeTime,
      maxFlightTime,
      speed,
    } = inputData;

    const { points, bases }: { points: Point[]; bases: [Point, Point] } =
      JSON.parse(fs.readFileSync(__dirname + '/../../coords.json').toString());
    const shuffledPoints = randomlyReplaceArrayElements(points);
    const [startBase2, anotherBase2] = bases;
    const maxFlightTime2: Milliseconds = 120000;
    const speed2: KilometersPeHour = 30;
    const chargeTime2 = 60000;
    console.time('algorithm time');
    const solution = this.solver(
      shuffledPoints,
      startBase2,
      anotherBase2,
      chargeTime2,
      maxFlightTime2,
      speed2,
    );

    console.timeEnd('algorithm time');

    this.lastSolutionByUsers.set(user.id, solution);

    return solution;

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
    // console.log({ ft: calculateFitnessByTime(route) });
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

  performExperiment(inputData: PerformExperimentInputData, user: User) {
    const { algorithm, numberOfPoints, numberOfRuns } = inputData;
    const solver = this.algorithmNameMapping[algorithm];
    const results: Result[] = [];
    for (let i = 0; i < numberOfRuns; i++) {
      console.log('iter', i);
      const problem = generateProblem(this.standardSquare, numberOfPoints);
      results.push(solver(...problem));

      const { fitness: randomFitness } = buildValidRoute(...problem);
      const { fitness: greedyFitness } = buildGreedyRoute(...problem);
      console.log('RANDOM_SOLUTION_FITNESS:', randomFitness);
      console.log('GREEDY_SOLUTION_FITNESS:', greedyFitness);
    }

    const fitnesses = results.map(({ fitness }) => fitness);

    const experimentProcessedResult: ExperimentResultForDownload = {
      ...inputData,
      mean: this.preparedAverage(fitnesses),
      standardDeviation: this.preparedStandardDev(fitnesses),
    };

    this.lastExperimentByUsers.set(user.id, experimentProcessedResult);

    return results;
  }

  private calculateAverage(numbers: number[]) {
    if (numbers.length === 0) {
      return 0;
    }

    const sum = numbers.reduce((acc, x) => acc + x, 0);
    return sum / numbers.length;
  }

  private calculateStandardDev = (numbers: number[]) => {
    if (numbers.length === 0) {
      return 0;
    }

    const standardDev = Math.sqrt(
      numbers
        .map((n) => Math.pow(n - this.calculateAverage(numbers), 2))
        .reduce((acc, x) => acc + x) / numbers.length,
    );

    return standardDev;
  };

  private millisecondsToMinutes = (millisec: number) => {
    return millisec / 60000;
  };

  private roundTo2DigitsAfterDot = (n: number) => {
    return Math.round(n * 100) / 100;
  };

  private preparedStandardDev = R.compose(
    this.roundTo2DigitsAfterDot,
    this.millisecondsToMinutes,
    this.calculateStandardDev,
  );

  private preparedAverage = R.compose(
    this.roundTo2DigitsAfterDot,
    this.millisecondsToMinutes,
    this.calculateAverage,
  );

  // TEMPORAR
  // TODO: replace with db
  private lastSolutionByUsers = new Map<string, Solution>();

  // TEMPORAR
  // TODO: replace with db
  private lastExperimentByUsers = new Map<
    string,
    ExperimentResultForDownload
  >();

  // TODO: need to remove the file after it is sent to the user
  async downloadLastResult(user: User) {
    const path = join(process.cwd(), 'tmp', `${user.username}LastResult.json`);
    const lastResult = this.lastSolutionByUsers.get(user.id);
    if (!lastResult) {
      return new NoLastEntityYetError();
    }

    await fs.outputFile(path, JSON.stringify(lastResult));
    const file = fs.createReadStream(path);
    return new StreamableFile(file);
  }

  // TODO: need to remove the file after it is sent to the user
  async downloadLastExperiment(user: User) {
    const path = join(
      process.cwd(),
      'tmp',
      `${user.username}LastExperiment.json`,
    );

    const lastExperiment = this.lastExperimentByUsers.get(user.id);
    if (!lastExperiment) {
      return new NoLastEntityYetError();
    }

    await fs.outputFile(path, JSON.stringify(lastExperiment));
    const file = fs.createReadStream(path);
    return new StreamableFile(file);
  }
}

export class NoLastEntityYetError extends HttpException {
  constructor() {
    super('You need to solve your first problem first', 403);
  }
}
