import { Point } from './models';

const mockedPoints: Point[] = [
  { lat: 37.7749, lng: -122.4194 },
  { lat: 37.7833, lng: -122.4167 },
  { lat: 37.7942, lng: -122.407 },
  { lat: 37.7959, lng: -122.4111 },
];

const mockedStartBase: Point = { lat: 37.7777, lng: -122.4205 };
const mockedRestOfBases: Point[] = [
  { lat: 37.7844, lng: -122.4179 },
  { lat: 37.7947, lng: -122.4174 },
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
