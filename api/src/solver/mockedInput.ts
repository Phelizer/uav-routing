import { Point } from './models';

const mockedPoints: Point[] = [
  { isBase: false, lat: 37.7749, lng: -122.4194 },
  { isBase: false, lat: 37.7833, lng: -122.4167 },
  { isBase: false, lat: 37.7942, lng: -122.407 },
  { isBase: false, lat: 37.7959, lng: -122.4111 },
];

const mockedStartBase: Point = { isBase: true, lat: 37.7777, lng: -122.4205 };
const mockedRestOfBases: Point[] = [
  { isBase: true, lat: 37.7844, lng: -122.4179 },
  { isBase: true, lat: 37.7947, lng: -122.4174 },
];

const milisecondsInMin = 60000;

export const mockedInput = {
  pointsToObserve: mockedPoints,
  startBase: mockedStartBase,
  restOfBases: mockedRestOfBases,
  chargeTime: 3 * milisecondsInMin,
  maxFlightTime: 20 * milisecondsInMin,
  speed: 70, // in km/h
};
