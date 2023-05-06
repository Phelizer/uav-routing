import { Injectable } from '@nestjs/common';
import { KilometersPeHour, Milliseconds, Point, Solver } from './models';
import * as fs from 'fs-extra';
import {
  TabuParams,
  createCalculateStopsFitness,
  createCalculateTimeFitness,
  createTabuSolver,
} from './tabuSolver';
import { AntColonyParams, createAntColonySolver } from './antColonySolver';

interface CalculateRouteParams {
  pointsToObserve: Point[];
  startBase: Point;
  anotherBase: Point;
  chargeTime: Milliseconds;
  maxFlightTime: Milliseconds;
  speed: KilometersPeHour;
}

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
      antsNumber: 70,
      evaporationRate: 0.2,
      heurInfoImportance: 0.5,
      pheromoneImportance: 0.5,
      maxIterationsWithoutImprovement: 30,
    };

    return createAntColonySolver(antColonyParams);
  }

  private solver: Solver = this.getAntColonySolver();
  setSolver = (solver: Solver) => {
    this.solver = solver;
  };

  calculateRoute({
    pointsToObserve,
    startBase,
    anotherBase,
    chargeTime,
    maxFlightTime,
    speed,
  }: CalculateRouteParams): any {
    // const { points, bases }: { points: Point[]; bases: [Point, Point] } =
    //   JSON.parse(fs.readFileSync(__dirname + '/../../coords.json').toString());
    // const shuffledPoints = this.randomlyReplaceArrayElements(points);
    // const [startBase2, anotherBase2] = bases;
    // const maxFlightTime2: Milliseconds = 120000;
    // const speed2: KilometersPeHour = 30;
    // const chargeTime2 = 60000;
    // console.time('tabu');
    // const { route, fitness } = this.solver(
    //   shuffledPoints,
    //   startBase2,
    //   anotherBase2,
    //   chargeTime2,
    //   maxFlightTime2,
    //   speed2,
    // );
    // console.timeEnd('tabu');
    // const calcualteFitnessByStops = createCalculateStopsFitness(bases);
    // const calculateFitnessByTime = createCalculateTimeFitness(
    //   speed2,
    //   maxFlightTime2,
    //   chargeTime2,
    // );
    // return {
    //   route,
    //   fitness,
    //   stops: calcualteFitnessByStops(route),
    //   totalTime: calculateFitnessByTime(route),
    // };

    const bases = [startBase, anotherBase];

    const calcualteFitnessByStops = createCalculateStopsFitness(bases);
    const calculateFitnessByTime = createCalculateTimeFitness(
      speed,
      maxFlightTime,
      chargeTime,
    );

    const { route, fitness } = this.solver(
      pointsToObserve,
      startBase,
      anotherBase,
      chargeTime,
      maxFlightTime,
      speed,
    );

    return {
      route,
      fitness,
      stops: calcualteFitnessByStops(route),
      totalTime: calculateFitnessByTime(route),
    };
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
