import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

let client: PrismaClient | undefined;

export function getOversightDbClient() {
  const connectionString = process.env.OVERSIGHT_DATABASE_URL;
  if (!connectionString) {
    throw new Error("Oversight read database is not configured");
  }
  client ??= new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      max: 3,
      options: "-c default_transaction_read_only=on -c statement_timeout=15000",
    }),
  });
  return client;
}
