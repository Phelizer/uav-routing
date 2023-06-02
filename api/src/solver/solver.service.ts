import { HttpException, Injectable, StreamableFile } from '@nestjs/common';
import {
  AlgorithmName,
  AlgorithmParameters,
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
import { createTabuSolver } from './tabuSolver';
import { createAntColonySolver } from './antColonySolver';
import { createBeesAlgorithmSolver } from './beesAlgorithmSolver';
import { Square, generateProblem } from './generateRandomPoint';
import { buildGreedyRoute, buildValidRoute } from './initValidSolution';
import { User } from 'src/users/users.service';
import { join } from 'path';
import { randomlyReplaceArrayElements } from 'src/utils';
import * as R from 'ramda';
import { DBService } from 'src/db/db.service';

interface ExperimentResultForDownload extends PerformExperimentInputData {
  mean: number;
  standardDeviation: number;
}

@Injectable()
export class SolverService {
  constructor(private readonly dbService: DBService) {}

  private readonly STANDARD_BEES_PARAMS = {
    maxOfIterWithoutImpr: 30,
    numberOfBestSolutions: 10,
    solutionPopulationSize: 20,
  };
  private readonly STANDARD_TABU_PARAMS = {
    maxIterationsWithoutImprovement: 10,
    numOfRuns: 30,
    tabuTenure: 100,
  };
  private readonly STANDARD_ANTS_PARAMS = {
    antsNumber: 15,
    evaporationRate: 0.1,
    heurInfoImportance: 0.5,
    pheromoneImportance: 5,
    maxIterationsWithoutImprovement: 30,
  };

  private solver: Solver = createBeesAlgorithmSolver(this.STANDARD_BEES_PARAMS);

  private solverFactoryMapping = {
    ants: createAntColonySolver,
    bees: createBeesAlgorithmSolver,
    tabu: createTabuSolver,
  };

  async calculateRoute(
    inputData: CalculateRouteInputData,
    user: User,
  ): Promise<Result & Record<string, unknown>> {
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

    console.log('=============');
    console.log({
      shuffledPoints,
      startBase2,
      anotherBase2,
      chargeTime2,
      maxFlightTime2,
      speed2,
    });
    console.log('=============');
    console.log('=============');
    console.log({
      pointsToObserve,
      startBase,
      anotherBase,
      chargeTime,
      maxFlightTime,
      speed,
    });
    console.log('=============');
    // const solution = this.solver(
    //   shuffledPoints,
    //   startBase2,
    //   anotherBase2,
    //   chargeTime2,
    //   maxFlightTime2,
    //   speed2,
    // );

    // console.timeEnd('algorithm time');

    // await this.saveSolutionToDB(user.id, solution);

    // return solution;

    const solution = this.solver(
      pointsToObserve,
      startBase,
      anotherBase,
      chargeTime,
      maxFlightTime,
      speed,
    );

    return solution;
  }

  private async saveSolutionToDB(userID: number, solution: Solution) {
    const { rows } = await this.dbService.runQuery(`
      INSERT INTO solutions (user_id, fitness)
      VALUES (${userID}, ${solution.fitness})
      RETURNING id;
    `);

    const solutionID = rows[0].id;

    for (const [i, point] of solution.route.entries()) {
      await this.dbService.runQuery(`
        INSERT INTO points (solution_id, domain_id, lat, lng, isBase, isStartBase, label, sequence_number)
        VALUES (${solutionID}, ${point.id}, ${point.lat}, ${point.lng}, ${point.isBase}, ${point.isStartBase}, '${point.label}', ${i});
      `);
    }
  }

  private readonly standardSquare: Square = {
    leftTopPoint: { lat: 50.53509088416523, lng: 30.36908789440387 },
    rightBottomPoint: { lat: 50.384682508571416, lng: 30.74135785432749 },
  };

  async performExperiment(inputData: PerformExperimentInputData, user: User) {
    const { algorithm, numberOfPoints, numberOfRuns, params } = inputData;
    const solver = this.solverFactoryMapping[algorithm](params as any);
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

    await this.saveExperimentToDB(user.id, experimentProcessedResult);

    return results;
  }

  private async saveExperimentToDB(
    userID: number,
    experimendResult: ExperimentResultForDownload,
  ) {
    await this.dbService.runQuery(`
      INSERT INTO experiments (user_id, numberOfPoints, numberOfRuns, algorithm, params, mean, standardDeviation)
      VALUES (
        ${userID},
        ${experimendResult.numberOfPoints},
        ${experimendResult.numberOfRuns},
        '${experimendResult.algorithm}',
        '${JSON.stringify(experimendResult.params)}',
        ${experimendResult.mean},
        ${experimendResult.standardDeviation}
      )
    `);
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

  // TODO: need to remove the file after it is sent to the user
  async downloadLastResult(user: User) {
    const path = join(process.cwd(), 'tmp', `${user.username}LastResult.json`);

    const lastResult = await this.getLastResult(user.id);
    if (!lastResult) {
      return new NoLastEntityYetError();
    }

    await fs.outputFile(path, JSON.stringify(lastResult));
    const file = fs.createReadStream(path);
    return new StreamableFile(file);
  }

  private async getLastResult(userID: number): Promise<Solution | undefined> {
    const { rows } = await this.dbService.runQuery(`
    WITH last_solution AS (
      SELECT id, fitness
      FROM solutions
      WHERE user_id = ${userID}
      ORDER BY created_at DESC
      LIMIT 1
    )
    SELECT points.*, last_solution.fitness
    FROM last_solution
    JOIN points ON last_solution.id = points.solution_id;
    `);

    if (rows.length === 0) {
      return;
    }

    const route = rows.map(this.dbToAppPointAdapter);
    const fitness = rows[0].fitness;

    return {
      fitness,
      route,
    };
  }

  private dbToAppPointAdapter = (dbPoint: DBPoint): Point => {
    return {
      id: dbPoint.domain_id,
      isBase: dbPoint.isbase,
      isStartBase: dbPoint.isstartbase,
      label: dbPoint.label,
      lat: dbPoint.lat,
      lng: dbPoint.lng,
    };
  };

  // TODO: need to remove the file after it is sent to the user
  async downloadLastExperiment(user: User) {
    const path = join(
      process.cwd(),
      'tmp',
      `${user.username}LastExperiment.json`,
    );

    // const lastExperiment = this.lastExperimentByUsers.get(user.id);
    const lastExperiment = await this.getLastExperiment(user.id);
    if (!lastExperiment) {
      return new NoLastEntityYetError();
    }

    await fs.outputFile(path, JSON.stringify(lastExperiment));
    const file = fs.createReadStream(path);
    return new StreamableFile(file);
  }

  private async getLastExperiment(userID: number) {
    const { rows } = await this.dbService.runQuery(`
      SELECT *
      FROM experiments
      WHERE user_id = ${userID}
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (rows.length === 0) {
      return;
    }

    const dbExperiment = rows[0];

    return this.dbToAppExperimentAdapter(dbExperiment);
  }

  private dbToAppExperimentAdapter = (
    dbExperiment: DBExperiment,
  ): ExperimentResultForDownload => {
    return {
      algorithm: dbExperiment.algorithm as AlgorithmName,
      mean: dbExperiment.mean,
      standardDeviation: dbExperiment.standarddeviation,
      numberOfPoints: dbExperiment.numberofpoints,
      numberOfRuns: dbExperiment.numberofruns,
      params: dbExperiment.params,
    };
  };
}

export class NoLastEntityYetError extends HttpException {
  constructor() {
    super('You need to solve your first problem first', 403);
  }
}

interface DBPoint {
  id: number;
  domain_id: number;
  solution_id: number;
  lat: number;
  lng: number;
  isbase: boolean;
  isstartbase: boolean;
  label: string;
  sequence_number: number;
  created_at: unknown;
}

interface DBExperiment {
  id: number;
  user_id: number;
  numberofpoints: number;
  numberofruns: number;
  algorithm: string;
  params: AlgorithmParameters;
  mean: number;
  standarddeviation: number;
  created_at: unknown;
}
