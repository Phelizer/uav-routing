import { API_BASE_URL } from "../consts";
import { fetchAPI } from "../fetchAPI";
import { getStandardHeaders } from "../getStandardHeaders";
import { isLoginResponse } from "./models";

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

  return await fetchAPI(url, isLoginResponse, options);
}
