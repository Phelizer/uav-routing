import { Point } from './models';

const mockedPoints: Point[] = [
  {
    label: 'Point 1',
    isStartBase: false,
    isBase: false,
    lat: 37.7749,
    lng: -122.4194,
  },
  {
    label: 'Point 2',
    isStartBase: false,
    isBase: false,
    lat: 37.7833,
    lng: -122.4167,
  },
  {
    label: 'Point 3',
    isStartBase: false,
    isBase: false,
    lat: 37.7942,
    lng: -122.407,
  },
  {
    label: 'Point 4',
    isStartBase: false,
    isBase: false,
    lat: 37.7959,
    lng: -122.4111,
  },
];

const mockedStartBase: Point = {
  isStartBase: true,
  isBase: true,
  lat: 37.7777,
  lng: -122.4205,
  label: 'Base 1',
};

const mockedRestOfBases: Point[] = [
  {
    label: 'Base 2',
    isStartBase: false,
    isBase: true,
    lat: 37.7844,
    lng: -122.4179,
  },
  {
    label: 'Base 3',
    isStartBase: false,
    isBase: true,
    lat: 37.7947,
    lng: -122.4174,
  },
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
