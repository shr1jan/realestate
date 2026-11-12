import { defineConfig } from "drizzle-kit";
export default defineConfig({ schema: "./db/postgres/schema.ts", out: "./drizzle-postgres", dialect: "postgresql" });
