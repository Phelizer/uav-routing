import { isBoolean, isNumber, isRecord, isString } from "./utils/utils";

export interface Point {
  lat: number;
  lng: number;
  isBase: boolean;
  isStartBase: boolean;
  label: string;
  id: number;
}

export function isPoint(value: unknown): value is Point {
  return (
    isRecord(value) &&
    "lat" in value &&
    isNumber(value.lat) &&
    "lng" in value &&
    isNumber(value.lng) &&
    "isBase" in value &&
    isBoolean(value.isBase) &&
    "label" in value &&
    isString(value.label)
  );
}

export const ALGORITHMS = ["tabu", "bees", "ants"] as const;
export type Algo = (typeof ALGORITHMS)[number];

export interface Solution {
  fitness: number;
  route: Point[];
}

export const isSolution = (value: unknown): value is Solution =>
  isRecord(value) &&
  "route" in value &&
  Array.isArray(value.route) &&
  value.route.every(isPoint) &&
  "fitness" in value &&
  isNumber(value.fitness);

export const ROLES = ["user", "researcher"] as const;
export type Role = (typeof ROLES)[number];

export type AlgoritmParameters =
  | TabuParameters
  | AntColonyParameters
  | BeesAlgorithmParameters;

export interface TabuParameters {
  tabuTenure: string;
  numOfRuns: string;
  maxIterationsWithoutImprovement: string;
}

export interface AntColonyParameters {
  evaporationRate: string;
  antsNumber: string;
  heurInfoImportance: string;
  pheromoneImportance: string;
  maxIterationsWithoutImprovement: string;
}

export interface BeesAlgorithmParameters {
  maxOfIterWithoutImpr: string;
  numberOfBestSolutions: string;
  solutionPopulationSize: string;
}

export type SettersOf<T> = Record<keyof T, (value: string) => void>;

export interface HttpError {
  response: string;
  status: number;
  message: string;
  name: string;
}

export function isHttpError(value: unknown): value is HttpError {
  return (
    isRecord(value) &&
    "response" in value &&
    isString(value.response) &&
    "status" in value &&
    isNumber(value.status) &&
    "message" in value &&
    isString(value.message) &&
    "name" in value &&
    isString(value.name)
  );
}
