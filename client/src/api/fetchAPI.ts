import Cookies from "js-cookie";
import { SomethingWrongError, UnexpectedDataError } from "./errors";
import { CookieKeys } from "../utils/consts";

// TODO: rewrite
export async function fetchAPI<Result>(
  url: string,
  typeGuard: (value: unknown) => value is Result,
  options?: RequestInit
) {
  const response = await fetch(url, options);
  if (response.status === 401) {
    Cookies.remove(CookieKeys.accessToken);
    // TODO: add a toast or something that notifies user that his session has expired
    window.location.reload();
  }

  if (!response.ok) {
    throw new SomethingWrongError(response.status);
  }

  const json = await response.json();
  if (!typeGuard(json)) {
    throw new UnexpectedDataError();
  }

  return json;
}
