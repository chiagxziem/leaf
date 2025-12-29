import { resolver } from "hono-openapi";
import z from "zod";

/**
 * Helper function to create a success response schema for OpenAPI responses.
 */
export const createSuccessResponseSchema = <T extends z.ZodType>(
  details: string,
  dataSchema: T,
) => {
  return z.object({
    status: z.literal("success"),
    details: z.literal(details),
    data: dataSchema,
  });
};

/**
 * Helper function to create an error response schema for OpenAPI responses.
 */
export const createErrorResponseSchema = () => {
  return z.object({
    status: z.literal("error"),
    error: z.object({
      code: z.string(),
      details: z.string(),
      fields: z.record(z.string(), z.string()),
    }),
  });
};

/**
 * Helper function to create a success response for OpenAPI responses.
 */
export const createSuccessResponse = <T extends z.ZodType>(
  description: string,
  schema: {
    details: string;
    dataSchema: T;
  },
) => {
  return {
    description,
    content: {
      "application/json": {
        schema: resolver(
          createSuccessResponseSchema(schema.details, schema.dataSchema),
        ),
      },
    },
  };
};

/**
 * Helper function to create an error response for OpenAPI responses.
 */
export const createErrorResponse = (
  description: string,
  examples: Record<
    string,
    {
      summary: string;
      code: string;
      details: string;
      fields?: Record<string, string>;
    }
  >,
) => {
  return {
    description,
    content: {
      "application/json": {
        schema: resolver(createErrorResponseSchema()),
        examples: Object.fromEntries(
          Object.entries(examples).map(([key, example]) => [
            key,
            {
              summary: example.summary,
              value: {
                status: "error",
                error: {
                  code: example.code,
                  details: example.details,
                  fields: example.fields || {},
                },
              },
            },
          ]),
        ),
      },
    },
  };
};

/**
 * Helper function to create a generic error response for OpenAPI responses.
 */
export const createGenericErrorResponse = (
  description: string,
  content: {
    code: string;
    details: string;
  },
) => {
  return {
    description,
    content: {
      "application/json": {
        schema: resolver(createErrorResponseSchema()),
        examples: {
          error: {
            summary: description,
            value: {
              status: "error",
              error: {
                code: content.code,
                details: content.details,
                fields: {},
              },
            },
          },
        },
      },
    },
  };
};

/**
 * Helper function to create a rate limit error response for OpenAPI responses.
 */
export const createRateLimitErrorResponse = () => {
  return {
    description: "Rate limit exceeded",
    content: {
      "application/json": {
        schema: resolver(createErrorResponseSchema()),
        examples: {
          error: {
            summary: "Rate limit exceeded",
            value: {
              status: "error",
              error: {
                code: "TOO_MANY_REQUESTS",
                details:
                  "Too many requests have been made. Please try again later.",
                fields: {},
              },
            },
          },
        },
      },
    },
  };
};

/**
 * Helper function to create a server error response for OpenAPI responses.
 */
export const createServerErrorResponse = () => {
  return {
    description: "Internal server error",
    content: {
      "application/json": {
        schema: resolver(createErrorResponseSchema()),
        examples: {
          error: {
            summary: "Internal server error",
            value: {
              status: "error",
              error: {
                code: "INTERNAL_SERVER_ERROR",
                details: "An unexpected error occurred",
                fields: {},
              },
            },
          },
        },
      },
    },
  };
};

/**
 * Helper function for getting error details from error fields
 */
export const getErrDetailsFromErrFields = (fields: Record<string, string>) => {
  return `${Object.keys(fields)[0]}: ${Object.values(fields)[0]}`;
};
