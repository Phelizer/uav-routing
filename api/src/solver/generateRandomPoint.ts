import { Degrees, Point } from './models';

export function generateRandomPoint(): Point {
  return {
    lat: generateRandomCoord(),
    lng: generateRandomCoord(),
  };
}

export function generateRandomCoord(): Degrees {
  return Math.random() * (180 - -180) + -180;
}
