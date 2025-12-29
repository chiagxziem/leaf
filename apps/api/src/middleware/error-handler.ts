import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import env from "@/lib/env";
import HttpStatusCodes from "@/lib/http-status-codes";
import { errorResponse } from "@/lib/utils";

/**
 * Central error handler for the Hono app.
 * Handles various error types and returns consistent error responses.
 */
const errorHandler: ErrorHandler = (err, c) => {
  const nodeEnv = c.env?.NODE_ENV || env.NODE_ENV;
  const isDev = nodeEnv !== "production";

  // Handle Hono HTTPException (thrown by middleware, auth, etc.)
  if (err instanceof HTTPException) {
    const status = err.status as ContentfulStatusCode;
    const message = err.message || getDefaultMessageForStatus(status);

    // Log client errors in dev, server errors always
    if (status >= 500 || isDev) {
      console.error(`[${status}] HTTPException:`, err.message);
    }

    return c.json(errorResponse(getCodeForStatus(status), message), status);
  }

  // Handle errors with a status property (e.g., from libraries like better-auth)
  if (isHttpError(err)) {
    const status = err.status as ContentfulStatusCode;
    const message = isDev ? err.message : getDefaultMessageForStatus(status);
    const code = err.code || getCodeForStatus(status);

    if (status >= 500 || isDev) {
      console.error(`[${status}] HTTP Error:`, err);
    }

    return c.json(errorResponse(code, message), status);
  }

  // Handle syntax errors (malformed JSON, etc.)
  if (err instanceof SyntaxError) {
    console.error("SyntaxError:", err.message);
    return c.json(
      errorResponse(
        "BAD_REQUEST",
        isDev ? err.message : "Invalid request syntax",
      ),
      HttpStatusCodes.BAD_REQUEST,
    );
  }

  // Handle type errors (often from accessing undefined properties)
  if (err instanceof TypeError) {
    console.error("TypeError:", err);
    return c.json(
      errorResponse(
        "INTERNAL_SERVER_ERROR",
        isDev ? err.message : "An unexpected error occurred",
      ),
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  // Catch-all for unknown errors
  console.error("Unhandled error:", err);

  return c.json(
    errorResponse(
      "INTERNAL_SERVER_ERROR",
      isDev
        ? err instanceof Error
          ? err.message
          : String(err)
        : "An unexpected error occurred",
    ),
    HttpStatusCodes.INTERNAL_SERVER_ERROR,
  );
};

/**
 * Type guard for HTTP-like errors with status codes
 */
function isHttpError(
  err: unknown,
): err is { status: number; message: string; code?: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as Record<string, unknown>).status === "number"
  );
}

/**
 * Get a standard error code for a given HTTP status
 */
function getCodeForStatus(status: number): string {
  const statusCodes: Record<number, string> = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    405: "METHOD_NOT_ALLOWED",
    409: "CONFLICT",
    422: "UNPROCESSABLE_ENTITY",
    429: "TOO_MANY_REQUESTS",
    500: "INTERNAL_SERVER_ERROR",
    502: "BAD_GATEWAY",
    503: "SERVICE_UNAVAILABLE",
    504: "GATEWAY_TIMEOUT",
  };

  return (
    statusCodes[status] || (status >= 500 ? "SERVER_ERROR" : "CLIENT_ERROR")
  );
}

/**
 * Get a default user-friendly message for a given HTTP status
 */
function getDefaultMessageForStatus(status: number): string {
  const messages: Record<number, string> = {
    400: "Bad request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not found",
    405: "Method not allowed",
    409: "Conflict",
    422: "Unprocessable entity",
    429: "Too many requests. Please try again later.",
    500: "An unexpected error occurred",
    502: "Bad gateway",
    503: "Service unavailable",
    504: "Gateway timeout",
  };

  return (
    messages[status] ||
    (status >= 500 ? "An unexpected error occurred" : "An error occurred")
  );
}

export default errorHandler;
