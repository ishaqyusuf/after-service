import { getDbClient } from "../../packages/db/src/index";
import { assertLocalTestDatabase } from "./local-env";

export function localTestDb() {
  assertLocalTestDatabase();
  return getDbClient();
}
