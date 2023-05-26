import { Role } from "../../models";
import { isRecord, isString } from "../../utils/utils";

export interface LoginResponse {
  access_token: string;
  roles: Role[];
}

export function isLoginResponse(value: unknown): value is LoginResponse {
  return (
    isRecord(value) &&
    "access_token" in value &&
    isString(value.access_token) &&
    "roles" in value &&
    Array.isArray(value.roles) &&
    value.roles.every(isString)
  );
}
