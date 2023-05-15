import { Point } from "../../models";
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

export async function downloadLastResultAPI(): Promise<Blob> {
  const url = `${API_BASE_URL}/solver/download-last-result`;
  const options = {
    method: "GET",
    headers: getStandardHeaders(),
  };

  // TODO: amend fetchAPI type so that it handle blob fetch without the need to provide typeguard
  const dummyGuard = (value: any): value is any => true;

  return await fetchAPI<Blob>(url, dummyGuard, options, true);
}
