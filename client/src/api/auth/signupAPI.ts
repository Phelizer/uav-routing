import { HttpError, Role, isHttpError } from "../../models";
import { API_BASE_URL } from "../consts";
import { fetchAPI } from "../fetchAPI";
import { getStandardHeaders } from "../getStandardHeaders";
import { LoginResponse, isLoginResponse } from "./models";

export interface SignupData {
  username: string;
  password: string;
  roles: Role[];
}

export async function signupAPI(body: SignupData) {
  const url = `${API_BASE_URL}/auth/signup`;
  const options = {
    method: "POST",
    body: JSON.stringify(body),
    headers: getStandardHeaders(),
  };

  const typeguard = (value: unknown): value is LoginResponse | HttpError =>
    isLoginResponse(value) || isHttpError(value);

  return await fetchAPI(url, typeguard, options);
}
