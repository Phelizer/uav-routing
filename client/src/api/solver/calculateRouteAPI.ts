import { Point, Solution, isSolution } from "../../models";
import { isNumber } from "../../utils/utils";
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
  ): value is Solution & { distance: number } =>
    isSolution(value) && "distance" in value && isNumber(value.distance);

  return await fetchAPI(url, typeguard, options);
}
