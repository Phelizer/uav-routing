import Cookies from "js-cookie";
import { SomethingWrongError, UnexpectedDataError } from "./errors";
import { CookieKeys } from "../utils/consts";

// TODO: rewrite
export async function fetchAPI<Result>(
  url: string,
  typeGuard: (value: unknown) => value is Result,
  options?: RequestInit,
  returnAsBlob = false
) {
  const response = await fetch(url, options);
  if (response.status === 401) {
    Cookies.remove(CookieKeys.accessToken);
    Cookies.remove(CookieKeys.roles);
    // TODO: add a toast or something that notifies user that his session has expired
    window.location.reload();
  }

  if (!response.ok) {
    throw new SomethingWrongError(response.status);
  }

  if (returnAsBlob) {
    return (await response.blob()) as Result;
  }

  const json = await response.json();
  if (!typeGuard(json)) {
    throw new UnexpectedDataError();
  }

  return json;
}
