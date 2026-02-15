import { neon } from "@neondatabase/serverless";
import { type NeonHttpDatabase, drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { type NodePgDatabase, drizzle as drizzleNode } from "drizzle-orm/node-postgres";

import * as authSchema from "./schemas/auth.schema";
import * as userSchema from "./schemas/auth.schema";
import * as folderSchema from "./schemas/folder.schema";
import * as noteSchema from "./schemas/note.schema";

const schema = {
  ...authSchema,
  ...folderSchema,
  ...noteSchema,
  ...userSchema,
};

export type Database = NeonHttpDatabase<typeof schema> | NodePgDatabase<typeof schema>;

/**
 * Creates a database instance with the appropriate driver based on the URL.
 *
 * - Neon URLs (containing `neon.tech`) → uses `@neondatabase/serverless` (HTTP)
 * - All other URLs (e.g. local Postgres) → uses `pg` (node-postgres)
 */
export const createDb = (databaseUrl: string): Database => {
  if (databaseUrl.includes("neon.tech")) {
    const sql = neon(databaseUrl);
    return drizzleNeon({
      client: sql,
      schema,
      casing: "snake_case",
    });
  }

  return drizzleNode({
    connection: databaseUrl,
    schema,
    casing: "snake_case",
  });
};

export * from "drizzle-orm";
