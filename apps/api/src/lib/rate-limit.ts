import { rateLimiter } from "hono-rate-limiter";

// Auth API rate limiter
export const authRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  limit: 100, // 100 requests per minute
  standardHeaders: "draft-6",
  keyGenerator: (c) => {
    // Use IP address for rate limiting
    const forwarded = c.req.header("x-forwarded-for");
    return forwarded?.split(",")[0] ?? c.req.header("x-real-ip") ?? "unknown";
  },
});

// General API rate limiter
export const apiRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  limit: 1000, // 1000 requests per minute
  standardHeaders: "draft-6",
  keyGenerator: (c) => {
    const forwarded = c.req.header("x-forwarded-for");
    return forwarded?.split(",")[0] ?? c.req.header("x-real-ip") ?? "unknown";
  },
});
