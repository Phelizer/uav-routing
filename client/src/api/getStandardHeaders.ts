import Cookies from "js-cookie";
import { CookieKeys } from "../utils/consts";

export function getStandardHeaders() {
  const jwt = Cookies.get(CookieKeys.accessToken);
  return {
    "Content-type": "application/json; charset=utf-8",
    Accept: "application/json",
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
  };
}
