export type ApiContext = {
  requestId: string;
};

export function createContext(): ApiContext {
  return {
    requestId: crypto.randomUUID(),
  };
}
