export function getApiBaseUrl() {
  if (
    typeof window !== "undefined" &&
    window.location.hostname === "localhost"
  ) {
    return "http://localhost:4102";
  }

  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4102";
}
