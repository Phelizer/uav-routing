import { Injectable } from '@nestjs/common';
import {
  Kilometers,
  KilometersPeHour,
  Milliseconds,
  Point,
  Solver,
  TimeWeights,
} from './models';
import { calculateDistance } from './calculateDistance';
import * as fs from 'fs-extra';
import {
  createCalculateTimeFitness,
  generateNeighbors,
  isValidRoute,
  tabuSolver,
} from './tabuSolver';
import { initValidSolution } from './initValidSolution';

interface CalculateRouteParams {
  pointsToObserve: Point[];
  startBase: Point;
  restOfBases: Point[];
  chargeTime: Milliseconds;
  maxFlightTime: Milliseconds;
  speed: KilometersPeHour;
}

@Injectable()
export class SolverService {
  private solver: Solver = tabuSolver;
  setSolver = (solver: Solver) => {
    this.solver = solver;
  };

  calculateRoute({
    pointsToObserve,
    startBase,
    restOfBases,
    chargeTime,
    maxFlightTime,
    speed,
  }: CalculateRouteParams): any {
    // normal:
    // const distanceWeights = this.calculateDistanceWeights(
    //   pointsToObserve,
    //   startBase,
    //   restOfBases,
    // );
    // const timeWeights = this.calculateTimeWeights(distanceWeights, speed);
    // const route = this.solver(
    //   pointsToObserve,
    //   startBase,
    //   restOfBases,
    //   timeWeights,
    //   chargeTime,
    //   maxFlightTime,
    // );

    // test2:
    const { points, bases }: { points: Point[]; bases: [Point, Point] } =
      JSON.parse(fs.readFileSync(__dirname + '/../../coords.json').toString());

    const shuffledPoints = this.randomlyReplaceArrayElements(points);

    const [startBase2, anotherBase2] = bases;
    const maxFlightTime2: Milliseconds = 120000;
    const speed2: KilometersPeHour = 30;

    const chargeTime2 = 60000;

    const route = this.solver(
      shuffledPoints,
      startBase2,
      anotherBase2,
      chargeTime2,
      maxFlightTime2,
      speed2,
    );

    const initialSolution = initValidSolution(
      shuffledPoints,
      startBase2,
      anotherBase2,
      chargeTime2,
      maxFlightTime2,
      speed2,
    );

    const dist = this.calculateRouteDistance(route);

    return {
      maxFlightTime2,
      route,
      distance: dist,
    };
  }

  private calculateRouteDistance(route: Point[]): Kilometers {
    let distance = 0;
    let prevPoint = route[0];
    for (const currPoint of route.slice(1)) {
      try {
        distance += calculateDistance(prevPoint, currPoint);
        prevPoint = currPoint;
      } catch (error) {
        console.log({ error });
        console.log({ prevPoint });
        console.log({ currPoint });
        throw error;
      }
    }

    return distance;
  }

  // the convention would be that in the weight matrics first rows are point to observe, then bases (first base, then rest of bases)
  // same for columns
  private calculateTimeWeights(
    distanceWeights: DistanceWeights,
    speed: KilometersPeHour,
  ): TimeWeights {
    const appliedCalculateTime = this.calculateTime(speed);
    const timeWeights: TimeWeights = distanceWeights.map((distRow) =>
      distRow.map(appliedCalculateTime),
    );

    return timeWeights;
  }

  private calculateTime =
    (speed: KilometersPeHour) =>
    (distance: Kilometers): Milliseconds => {
      const millisenondsInHour = 3600000;
      return (distance / speed) * millisenondsInHour;
    };

  // the convention would be that in the weight matrics first rows are point to observe, then bases (first base, then rest of bases)
  // same for columns
  private calculateDistanceWeights(
    pointsToObserve: Point[],
    startBase: Point,
    restOfBases: Point[],
  ): DistanceWeights {
    const timeWeights: TimeWeights = [];
    const allPoints = [...pointsToObserve, startBase, ...restOfBases];
    for (const point of allPoints) {
      timeWeights.push(this.calculateRowOfDistanceWeights(point, allPoints));
    }

    return timeWeights;
  }

  private calculateRowOfDistanceWeights(rowPoint: Point, allPoints: Point[]) {
    return allPoints.map((point) => calculateDistance(rowPoint, point));
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

type DistanceWeights = Kilometers[][];
