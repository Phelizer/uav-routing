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
