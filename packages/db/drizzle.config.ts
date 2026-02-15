import { defineConfig } from "drizzle-kit";

import env from "./src/lib/env";

export default defineConfig({
  schema: "./src/schemas",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  casing: "snake_case",
});
