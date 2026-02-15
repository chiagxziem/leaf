import type { Database } from "@repo/db";

/**
 * Returns the user with the given ID, or null if not found.
 */
export const getUserById = async (db: Database, userId: string) => {
  const user = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, userId),
  });

  return user;
};

/**
 * Returns the user with the given email, or null if not found.
 */
export const getUserByEmail = async (db: Database, email: string) => {
  const user = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.email, email),
  });

  return user;
};
