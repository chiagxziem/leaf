import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { migrate } from "drizzle-orm/node-postgres/migrator";

import { db } from "./index";

const hasMigrationJournal = (dir: string) =>
  fs.existsSync(path.join(dir, "meta", "_journal.json"));

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

const resolveMigrationsFolder = () => {
  const candidates = [
    // Docker runtime path copied in the API image.
    path.resolve(process.cwd(), "migrations"),
    // Local monorepo path when run from repository root.
    path.resolve(process.cwd(), "packages/db/src/migrations"),
    // Local package path when run from packages/db.
    path.resolve(process.cwd(), "src/migrations"),
    // Fallback for non-compiled execution.
    path.resolve(moduleDir, "migrations"),
  ];

  const folder = candidates.find(hasMigrationJournal);

  if (!folder) {
    throw new Error(
      `Could not find migrations folder. Checked:\n${candidates.join("\n")}`,
    );
  }

  return folder;
};

const runMigrations = async () => {
  try {
    console.log("Running migrations...");

    const start = Date.now();
    const migrationsFolder = resolveMigrationsFolder();

    console.log(`Using migrations folder: ${migrationsFolder}`);
    await migrate(db, {
      migrationsFolder,
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

void runMigrations();
