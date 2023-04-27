import { Point, TimeWeights } from './models';

export function geneticSolver(
  pointsToObserve: Point[],
  startBase: Point,
  restOfBases: Point[],
  timeWeights: TimeWeights,
  chargeTime: number,
): Point[] {
  // dummy for now
  return [startBase, ...pointsToObserve, restOfBases[0] ?? startBase];
}
