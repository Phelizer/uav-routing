import { Point, isPoint } from "../../models";
import { isNumber, isRecord } from "../../utils/utils";
import { API_BASE_URL } from "../consts";
import { fetchAPI } from "../fetchAPI";
import { getStandardHeaders } from "../getStandardHeaders";

export interface CalculateRouteData {
  pointsToObserve: Point[];
  startBase: Point;
  anotherBase: Point;
  chargeTime: number;
  maxFlightTime: number;
  speed: number;
}

export async function calculateRouteAPI(body: CalculateRouteData) {
  const url = `${API_BASE_URL}/solver/solve`;
  const options = {
    method: "POST",
    body: JSON.stringify(body),
    headers: getStandardHeaders(),
  };

  const typeguard = (
    value: unknown
  ): value is {
    route: Point[];
    fitness: number;
  } =>
    isRecord(value) &&
    "route" in value &&
    Array.isArray(value.route) &&
    value.route.every(isPoint) &&
    "fitness" in value &&
    isNumber(value.fitness);

  return await fetchAPI(url, typeguard, options);
}
