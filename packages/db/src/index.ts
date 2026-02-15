import { neon } from "@neondatabase/serverless";
import { type NeonHttpDatabase, drizzle } from "drizzle-orm/neon-http";

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

// Lazy initialization — defers neon() call until first use so that
// process.env.DATABASE_URL is available at request time in Cloudflare Workers.
let _db: NeonHttpDatabase<typeof schema> | null = null;

function getDb(): NeonHttpDatabase<typeof schema> {
  if (!_db) {
    const sql = neon(process.env.DATABASE_URL!);
    _db = drizzle({
      client: sql,
      schema,
      casing: "snake_case",
    });
  }
  return _db;
}

const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_, prop) {
    return (getDb() as any)[prop];
  },
});

export * from "drizzle-orm";
export { db };
