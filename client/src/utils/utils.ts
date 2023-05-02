export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
}

export function isString(value: unknown) {
  return typeof value === "string";
}
