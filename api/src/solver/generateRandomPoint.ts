import {
  calculateDistance,
  calculateTimeBetweenTwoPoints,
} from './calculateDistance';
import { Coords, Degrees, KilometersPeHour, Point, Solver } from './models';

// export function generateRandomPoint(): Point {
//   return {
//     lat: generateRandomCoord(),
//     lng: generateRandomCoord(),
//   };
// }

export interface Square {
  leftTopPoint: Coords;
  rightBottomPoint: Coords;
}

const createGenerateRandomPoint =
  (pointType: 'Base' | 'RegularPoint') =>
  (square: Square): Point => {
    const minimumLat = Math.min(
      square.leftTopPoint.lat,
      square.rightBottomPoint.lat,
    );

    const maximumLat = Math.max(
      square.leftTopPoint.lat,
      square.rightBottomPoint.lat,
    );

    const minimumLng = Math.min(
      square.leftTopPoint.lng,
      square.rightBottomPoint.lng,
    );

    const maximumLng = Math.max(
      square.leftTopPoint.lng,
      square.rightBottomPoint.lng,
    );

    return {
      lat: randomRealNumber(minimumLat, maximumLat),
      lng: randomRealNumber(minimumLng, maximumLng),
      isBase: pointType === 'Base',
    };
  };

export const generateRandomPoint = createGenerateRandomPoint('RegularPoint');
export const generateRandomBase = createGenerateRandomPoint('Base');

export function getSafeMaxFlightTime(square: Square, speed: KilometersPeHour) {
  const maxSingleFlightFlightTime = calculateTimeBetweenTwoPoints(
    square.leftTopPoint,
    square.rightBottomPoint,
    speed,
  );

  return 2 * maxSingleFlightFlightTime;
}

function randomRealNumber(minimum: number, maximum: number) {
  return Math.random() * (maximum - minimum) + minimum;
}

export function generateProblem(
  square: Square,
  numOfPoints: number,
): Parameters<Solver> {
  const millisecInMin = 60000;
  const pointsToObserve: Point[] = [];
  for (let i = 0; i < numOfPoints; i++) {
    pointsToObserve.push(generateRandomPoint(square));
  }

  const startBase = generateRandomBase(square);
  const anotherBase = generateRandomBase(square);
  const speed = 70;
  const maxFlightTime = getSafeMaxFlightTime(square, speed);
  const changeTime = 5 * millisecInMin;

  return [
    pointsToObserve,
    startBase,
    anotherBase,
    changeTime,
    maxFlightTime,
    speed,
  ];
}
