import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Server-only prepared client. Existing routes remain on D1 until cutover.
export function createPostgresDb(connectionString: string) {
  const url = new URL(connectionString);
  if (!["postgres:", "postgresql:"].includes(url.protocol)) throw new Error("DATABASE_URL must be a PostgreSQL connection string.");
  return drizzle(neon(connectionString), { schema });
}
