import type { Context } from "hono";

import HttpStatusCodes from "@/lib/http-status-codes";
import { errorResponse } from "@/lib/utils";

/**
 * Path segment from Standard Schema spec
 */
interface PathSegment {
  readonly key: PropertyKey;
}

/**
 * Issue from Standard Schema spec (used by hono-openapi)
 */
interface StandardIssue {
  readonly message: string;
  readonly path?: readonly (PropertyKey | PathSegment)[] | undefined;
}

interface ValidationResult {
  success: boolean;
  data?: unknown;
  error?: readonly StandardIssue[];
  target?: string;
}

/**
 * Converts a path segment to a string representation
 */
function pathSegmentToString(segment: PropertyKey | PathSegment): string {
  if (typeof segment === "object" && segment !== null && "key" in segment) {
    return String(segment.key);
  }
  return String(segment);
}

/**
 * Converts a path array to a dot-notation string
 */
function pathToString(
  path: readonly (PropertyKey | PathSegment)[] | undefined,
): string {
  if (!path || path.length === 0) return "";
  return path.map(pathSegmentToString).join(".");
}

/**
 * Hook to handle validation errors from hono-openapi validators.
 * This provides consistent error responses matching the errorResponse format.
 *
 * Usage:
 * ```ts
 * validator("json", schema, validationHook)
 * ```
 */
export const validationHook = (result: ValidationResult, c: Context) => {
  if (!result.success && result.error) {
    const fields: Record<string, string> = {};
    let details = "";

    result.error.forEach((issue, index) => {
      const fieldPath = pathToString(issue.path);
      fields[fieldPath || "value"] = issue.message;

      // Use the first error as the main details message
      if (index === 0) {
        details = fieldPath ? `${fieldPath}: ${issue.message}` : issue.message;
      }
    });

    return c.json(
      errorResponse("INVALID_DATA", details, fields),
      HttpStatusCodes.BAD_REQUEST,
    );
  }
};

/**
 * Creates a validation hook with custom error code.
 *
 * Usage:
 * ```ts
 * validator("json", schema, createValidationHook("CUSTOM_ERROR_CODE"))
 * ```
 */
export const createValidationHook = (errorCode: string) => {
  return (result: ValidationResult, c: Context) => {
    if (!result.success && result.error) {
      const fields: Record<string, string> = {};
      let details = "";

      result.error.forEach((issue, index) => {
        const fieldPath = pathToString(issue.path);
        fields[fieldPath || "value"] = issue.message;

        if (index === 0) {
          details = fieldPath
            ? `${fieldPath}: ${issue.message}`
            : issue.message;
        }
      });

      return c.json(
        errorResponse(errorCode, details, fields),
        HttpStatusCodes.BAD_REQUEST,
      );
    }
  };
};
