import { Algo, Solution, isSolution } from "../../models";
import { API_BASE_URL } from "../consts";
import { fetchAPI } from "../fetchAPI";
import { getStandardHeaders } from "../getStandardHeaders";

export interface PerformExperimentData {
  algorithm: Algo;
  numberOfRuns: number;
  numberOfPoints: number;
}

export async function performExperimentAPI(body: PerformExperimentData) {
  const url = `${API_BASE_URL}/solver/experiment`;
  const options = {
    method: "POST",
    body: JSON.stringify(body),
    headers: getStandardHeaders(),
  };

  const typeguard = (value: unknown): value is Solution[] =>
    Array.isArray(value) && value.every(isSolution);

  return await fetchAPI(url, typeguard, options);
}
