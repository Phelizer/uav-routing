import { Milliseconds, Point, TimeWeights } from './models';

export function localSearchSolver(
  pointsToObserve: Point[],
  startBase: Point,
  restOfBases: Point[],
  timeWeights: TimeWeights,
  chargeTime: Milliseconds,
): Point[] {
  // dummy for now
  return [startBase, ...pointsToObserve, restOfBases[0] ?? startBase];
}
