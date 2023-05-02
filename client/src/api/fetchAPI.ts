import { SomethingWrongError, UnexpectedDataError } from "./errors";

// TODO: rewrite
export async function fetchAPI<Result>(
  url: string,
  typeGuard: (value: unknown) => value is Result,
  options?: RequestInit
) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new SomethingWrongError(response.status);
  }

  const json = await response.json();
  if (!typeGuard(json)) {
    throw new UnexpectedDataError();
  }

  return json;
}
