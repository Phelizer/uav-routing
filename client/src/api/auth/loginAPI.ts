import { isRecord, isString } from "../../utils/utils";
import { API_BASE_URL } from "../consts";
import { fetchAPI } from "../fetchAPI";
import { getStandardHeaders } from "../getStandardHeaders";

export interface LoginData {
  username: string;
  password: string;
}

export async function loginAPI(body: LoginData) {
  const url = `${API_BASE_URL}/auth/login`;
  const options = {
    method: "POST",
    body: JSON.stringify(body),
    headers: getStandardHeaders(),
  };

  const typeguard = (
    value: unknown
  ): value is {
    access_token: string;
  } =>
    isRecord(value) && "access_token" in value && isString(value.access_token);

  const { access_token } = await fetchAPI(url, typeguard, options);
  return access_token;
}
