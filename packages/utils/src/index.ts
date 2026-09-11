export * from "./app-urls";
export * from "./email";
export * from "./env";
export * from "./metadata";
export * from "./qa-accelerator";
export * from "./qa-network-source";
export * from "./runtime-url";

export function compact<T>(items: Array<T | null | undefined>): T[] {
  return items.filter((item): item is T => item != null);
}
