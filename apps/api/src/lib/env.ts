import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    API_URL: z.url(),
    WEB_URL: z.url(),
    DOMAIN: z.string().optional(),
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    ENCRYPTION_KEY: z.string().min(1),
    // Comma-separated list of allowed CORS origins (e.g., "http://localhost:3120,https://app.example.com")
    CORS_ORIGINS: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
