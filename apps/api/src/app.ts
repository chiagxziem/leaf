import type { AppEnv } from "@/types";
import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import emojiFavicon from "@/middleware/emoji-favicon";
import errorHandler from "@/middleware/error-handler";
import notFoundRoute from "@/middleware/not-found-route";

import { apiRateLimiter, authRateLimiter } from "./lib/rate-limit";
import { nonWwwRedirect } from "./middleware/non-www-redirect";

export const createRouter = () => {
  return new Hono<AppEnv>({ strict: false });
};

export const createApp = () => {
  const app = createRouter();

  // CORS
  const corsOrigins = env.CORS_ORIGINS
    ? env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
    : "*";

  app.use(
    "/*",
    cors({
      origin: corsOrigins,
      credentials: true,
    }),
  );

  app.use("/api/auth/*", authRateLimiter);
  app.use("/api/*", apiRateLimiter);

  // Security Headers
  app.use(
    "*",
    secureHeaders({
      xFrameOptions: "DENY",
      xXssProtection: "1",
      strictTransportSecurity:
        env.NODE_ENV === "production" ? "max-age=31536000; includeSubDomains" : false,
      referrerPolicy: "strict-origin-when-cross-origin",
    }),
  );

  // Non-www redirect
  app.use("*", nonWwwRedirect);

  // Compress response body, log requests and set up emoji favicon
  app.use(compress());
  app.use(logger());
  app.use(emojiFavicon("🍀"));

  // Auth
  app.on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw));

  // OpenAPI
  app.get(
    "/api/doc",
    openAPIRouteHandler(app, {
      documentation: {
        info: {
          title: "Leaf API",
          description: "The API for a note-taking app.",
          version: "0.0.1",
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
        servers: [{ url: env.API_URL }],
      },
    }),
  );

  // Scalar
  app.get(
    "/api/reference",
    Scalar({
      url: "/api/doc",
      authentication: {
        preferredSecurityScheme: "bearerAuth",
        securitySchemes: {
          bearerAuth: { token: "" },
        },
      },
      persistAuth: true,
      pageTitle: "Leaf API",
      theme: "saturn",
      hideModels: true,
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "axios",
      },
    }),
  );

  // Errors
  app.notFound(notFoundRoute);
  app.onError(errorHandler);

  return app;
};
