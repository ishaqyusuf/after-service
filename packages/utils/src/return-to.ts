/** Keep post-auth navigation on the current origin. */
export function getSafeReturnTo(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    // biome-ignore lint/suspicious/noControlCharactersInRegex: reject URL parser whitespace/control normalization
    /[\\\u0000-\u0020\u007f]/.test(value)
  ) {
    return "/";
  }
  return value;
}
