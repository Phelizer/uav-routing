import { isBoolean, isNumber, isRecord } from "./utils/utils";

export interface Point {
  lat: number;
  lng: number;
  isBase: boolean;
  isStartBase: boolean;
}

export function isPoint(value: unknown): value is Point {
  return (
    isRecord(value) &&
    "lat" in value &&
    isNumber(value.lat) &&
    "lng" in value &&
    isNumber(value.lng) &&
    "isBase" in value &&
    isBoolean(value.isBase)
  );
}
