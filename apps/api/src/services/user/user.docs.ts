import { UserSelectSchema } from "@repo/db/validators/user.validator";
import { describeRoute } from "hono-openapi";
import z from "zod";

import HttpStatusCodes from "@/lib/http-status-codes";
import {
  createErrorResponse,
  createGenericErrorResponse,
  createRateLimitErrorResponse,
  createServerErrorResponse,
  createSuccessResponse,
  getErrDetailsFromErrFields,
} from "@/lib/openapi";
import { userExamples } from "@/lib/openapi-examples";

const tags = ["User"];

export const getUserDoc = describeRoute({
  description: "Get the current user",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("User retrieved", {
      details: "User retrieved successfully",
      dataSchema: UserSelectSchema,
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const updateUserDoc = describeRoute({
  description: "Update the current user",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("User updated", {
      details: "User updated successfully",
      dataSchema: z.object({
        status: z.literal(true),
      }),
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request data", {
      validationError: {
        summary: "Invalid request data",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields(userExamples.updateUserValErrs),
        fields: userExamples.updateUserValErrs,
      },
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});
