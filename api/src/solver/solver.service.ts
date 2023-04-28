import { Injectable } from '@nestjs/common';
import { geneticSolver } from './geneticSolver';
import {
  Kilometers,
  KilometersPeHour,
  Milliseconds,
  Point,
  Solver,
  TimeWeights,
} from './models';
import { calculateDistance } from './calculateDistance';

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
  private solver: Solver = geneticSolver;
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
  }: CalculateRouteParams): Point[] {
    const distanceWeights = this.calculateDistanceWeights(
      pointsToObserve,
      startBase,
      restOfBases,
    );

    const timeWeights = this.calculateTimeWeights(distanceWeights, speed);

    // dummy responce for now
    return [startBase, ...pointsToObserve, startBase];
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
}

type DistanceWeights = Kilometers[][];
