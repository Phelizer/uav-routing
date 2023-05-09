import { Point, isSolution } from "../../models";
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

  return await fetchAPI(url, isSolution, options);
}
