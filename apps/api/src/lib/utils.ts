/**
 * Helper function to create a success response for API routes.
 * @param data - The data to include in the response.
 * @param details - Additional details about the response.
 * @returns An object representing the success response.
 */
export const successResponse = <TData, TDetails extends string>(
  data: TData,
  details: TDetails,
) => {
  return {
    status: "success" as const,
    details,
    data,
  };
};

/**
 * Helper function to create an error response for API routes.
 * @param code - The error code.
 * @param details - Additional details about the error.
 * @param fields - Optional fields to include in the error response.
 * @returns An object representing the error response.
 */
export const errorResponse = (
  code: string,
  details: string,
  fields?: Record<string, string>,
) => {
  return {
    status: "error",
    error: {
      code,
      details,
      fields: fields ?? {},
    },
  };
};

/**
 * Strips all hyphens from a string (useful for UUID formatting).
 * @param str - The string to process
 * @returns The string without hyphens
 */
export const stripHyphens = (str: string): string => str.replace(/-/g, "");

/**
 * Normalizes a log level to one of "debug", "info", "warn", or "error".
 * @param level - The log level to normalize
 * @returns The normalized log level
 */
export const normalizeLevel = (
  level: string,
): "debug" | "info" | "warn" | "error" => {
  const l = level?.toLowerCase();
  if (l === "debug" || l === "info" || l === "warn" || l === "error") {
    return l;
  }
  return "info";
};
