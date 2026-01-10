import path from "node:path";

import { migrate } from "drizzle-orm/node-postgres/migrator";

import { db } from "./index";

const runMigrations = async () => {
  try {
    console.log("Running migrations...");

    const start = Date.now();
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), "migrations"),
    });
    const end = Date.now();

    console.log(`Migrations completed in ${end - start}ms`);
    process.exit(0);
  } catch (err) {
    console.error("Migration failed");
    console.error(err);
    process.exit(1);
  }
};

runMigrations();
