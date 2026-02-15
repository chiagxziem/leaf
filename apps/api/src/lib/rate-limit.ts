import type { AppEnv } from "@/types";
import { rateLimiter } from "hono-rate-limiter";

import HttpStatusCodes from "@/lib/http-status-codes";
import { errorResponse } from "@/lib/utils";

// Auth API rate limiter
export const authRateLimiter = rateLimiter<AppEnv>({
  binding: (c) => c.env.AUTH_RATE_LIMITER,
  keyGenerator: (c) => {
    // Use IP address for rate limiting
    const forwarded = c.req.header("x-forwarded-for");
    return forwarded?.split(",")[0] ?? c.req.header("x-real-ip") ?? "unknown";
  },
  handler: (c) => {
    return c.json(
      errorResponse(
        "TOO_MANY_REQUESTS",
        "Too many requests have been made. Please try again later.",
      ),
      HttpStatusCodes.TOO_MANY_REQUESTS,
    );
  },
});

// General API rate limiter
export const apiRateLimiter = rateLimiter<AppEnv>({
  binding: (c) => c.env.API_RATE_LIMITER,
  keyGenerator: (c) => {
    const forwarded = c.req.header("x-forwarded-for");
    return forwarded?.split(",")[0] ?? c.req.header("x-real-ip") ?? "unknown";
  },
  handler: (c) => {
    return c.json(
      errorResponse(
        "TOO_MANY_REQUESTS",
        "Too many requests have been made. Please try again later.",
      ),
      HttpStatusCodes.TOO_MANY_REQUESTS,
    );
  },
});
