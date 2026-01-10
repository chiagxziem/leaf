import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    WEB_URL: z.url(),
    API_URL: z.url(),
    DATABASE_URL: z.url(),
  },

  clientPrefix: "VITE_",

  client: {
    VITE_AUTH_SERVER_URL: z.url(),
    VITE_BASE_URL: z.url(),
  },
  runtimeEnv: {
    // Server
    NODE_ENV: process.env.NODE_ENV,
    WEB_URL: process.env.WEB_URL,
    API_URL: process.env.API_URL,
    DATABASE_URL: process.env.DATABASE_URL,

    // Client
    VITE_AUTH_SERVER_URL: import.meta.env.VITE_AUTH_SERVER_URL,
    VITE_BASE_URL: import.meta.env.VITE_BASE_URL,
  },
  emptyStringAsUndefined: true,
});

export default env;
