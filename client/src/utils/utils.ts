export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

// form validation utils

/**
 * @param pattern - Error string where the "$1" will be replaced with the field name
 */
export const buildErrorMsg =
  (pattern: `${string}$1${string}`) => (fieldName: string) => {
    return pattern.replace("$1", fieldName);
  };

export const isRequiredErrorMsg = buildErrorMsg("$1 is required");
export const shouldBeNumberErrorMsg = buildErrorMsg("$1 should be a number");

export function isStringifiedFloat(value: unknown): boolean {
  return isString(value) && !isNaN(parseFloat(value));
}

export function isPresent(value: unknown): boolean {
  return value !== undefined && value !== null && value !== "";
}
