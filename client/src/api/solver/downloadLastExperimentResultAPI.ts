import { API_BASE_URL } from "../consts";
import { fetchAPI } from "../fetchAPI";
import { getStandardHeaders } from "../getStandardHeaders";

export async function downloadLastExperimentResultAPI(): Promise<Blob> {
  const url = `${API_BASE_URL}/solver/download-last-experiment-result`;
  const options = {
    method: "GET",
    headers: getStandardHeaders(),
  };

  // TODO: amend fetchAPI type so that it handle blob fetch without the need to provide typeguard
  const dummyGuard = (value: any): value is any => true;

  return await fetchAPI<Blob>(url, dummyGuard, options, true);
}
