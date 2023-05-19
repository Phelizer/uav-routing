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

let counter = 0;

const createGenerateRandomPoint =
  (pointType: 'StartBase' | 'RegularBase' | 'RegularPoint') =>
  (square: Square, pointNumber: number): Point => {
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
      isBase: pointType !== 'RegularPoint',
      isStartBase: pointType === 'StartBase',
      label: `${
        pointType === 'StartBase' || pointType === 'RegularBase'
          ? 'Base'
          : 'Point'
      } ${pointNumber}`,
      id: counter++,
    };
  };

export const generateRandomPoint = createGenerateRandomPoint('RegularPoint');
export const generateRandomStartBase = createGenerateRandomPoint('StartBase');
export const generateRandomRegularBase =
  createGenerateRandomPoint('RegularBase');

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
    pointsToObserve.push(generateRandomPoint(square, i + 1));
  }

  const startBase = generateRandomStartBase(square, 1);
  const anotherBase = generateRandomRegularBase(square, 2);
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
