import { createAuthClient } from "better-auth/react";

import env from "./env";

export const authClient = createAuthClient({
  baseURL: env.VITE_AUTH_SERVER_URL,
});
