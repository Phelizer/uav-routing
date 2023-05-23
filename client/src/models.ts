import { isBoolean, isNumber, isRecord, isString } from "./utils/utils";

export interface Point {
  lat: number;
  lng: number;
  isBase: boolean;
  isStartBase: boolean;
  label: string;
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

export type Role = "user" | "researcher";

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
