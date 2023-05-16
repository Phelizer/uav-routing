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

  performExperiment({
    algorithm,
    numberOfPoints,
    numberOfRuns,
  }: PerformExperimentInputData) {
    console.log('here');
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

    return results;
  }

  // TEMPORAR
  // TODO: replace with db
  private lastSolutionByUsers = new Map<string, Solution>();

  async downloadLastResult(user: User) {
    const path = join(process.cwd(), 'tmp', `${user.username}LastResult.json`);
    const lastResult = this.lastSolutionByUsers.get(user.id);
    if (!lastResult) {
      return new NoLastSolutionYetError();
    }

    console.log({ lastResult });
    await fs.outputFile(path, JSON.stringify(lastResult));
    const file = fs.createReadStream(path);
    return new StreamableFile(file);
  }
}

export class NoLastSolutionYetError extends HttpException {
  constructor() {
    super('You need to solve your first problem first', 403);
  }
}
