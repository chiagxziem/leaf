import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as authSchema from "./schemas/auth.schema";
import * as userSchema from "./schemas/auth.schema";
import * as folderSchema from "./schemas/folder.schema";
import * as noteSchema from "./schemas/note.schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({
  client: sql,
  schema: {
    ...authSchema,
    ...folderSchema,
    ...noteSchema,
    ...userSchema,
  },
  casing: "snake_case",
});

export * from "drizzle-orm";
export { db };
