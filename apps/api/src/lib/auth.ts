import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { env } from "cloudflare:workers";

import { createRootFolder } from "@/queries/folder-queries";
import { createDb } from "@repo/db";

type Auth = ReturnType<typeof betterAuth>;

// Lazy initialization — defers betterAuth() call until first access so that
// cloudflare:workers `env` bindings are available at request time, not during
// deploy-time module validation when they are undefined.
let _auth: Auth | null = null;

function getAuth(): Auth {
  if (!_auth) {
    _auth = betterAuth({
      database: drizzleAdapter(createDb(env.DATABASE_URL), {
        provider: "pg",
      }),

      socialProviders: {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      },

      account: {
        accountLinking: {
          enabled: true,
        },
      },

      databaseHooks: {
        user: {
          create: {
            after: async (user) => {
              await createRootFolder(createDb(env.DATABASE_URL), user.id);
            },
          },
        },
      },

      user: {
        additionalFields: {
          encryptionSalt: {
            type: "string",
            required: false,
          },
          encryptionVersion: {
            type: "number",
            required: true,
            defaultValue: 1,
          },
        },
      },

      baseURL: env.API_URL,
      trustedOrigins: [env.API_URL, env.WEB_URL],

      session: {
        expiresIn: 60 * 60 * 24 * 30,
      },

      advanced: {
        database: { generateId: "uuid" },
        cookies: {
          session_token: {
            name: "leaf_auth_session",
            attributes: {
              path: "/",
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              domain: process.env.NODE_ENV === "production" ? env.DOMAIN : undefined,
              expires: new Date(Date.now() + 60 * 60 * 24 * 30 * 1000),
            },
          },
        },
      },

      experimental: {
        joins: true,
      },

      plugins: [bearer()],
    });
  }
  return _auth;
}

export const auth = new Proxy({} as Auth, {
  get(_, prop) {
    return (getAuth() as any)[prop];
  },
});
