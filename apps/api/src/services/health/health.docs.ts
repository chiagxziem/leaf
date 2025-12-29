import { describeRoute } from "hono-openapi";
import z from "zod";

import HttpStatusCodes from "@/lib/http-status-codes";
import {
  createRateLimitErrorResponse,
  createServerErrorResponse,
  createSuccessResponse,
} from "@/lib/openapi";

const tags = ["Health"];

export const checkHealthDoc = describeRoute({
  description: "Check API health status",
  tags,
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("API is healthy", {
      details: "API is healthy",
      dataSchema: z.object({
        status: z.literal("ok"),
      }),
    }),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});
