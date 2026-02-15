import type { AppEnv } from "@/types";
import { createMiddleware } from "hono/factory";

import { createDb } from "@repo/db";

/**
 * Middleware that creates a database instance from `c.env.DATABASE_URL`
 * and stores it in Hono's context variables.
 */
export const dbMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const db = createDb(c.env.DATABASE_URL);
  c.set("db", db);
  return next();
});
