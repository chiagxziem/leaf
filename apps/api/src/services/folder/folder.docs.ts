import {
  FolderChildrenResponseSchema,
  FolderSelectSchema,
  FolderWithItemsSchema,
} from "@repo/db/validators/folder.validator";
import { describeRoute } from "hono-openapi";

import HttpStatusCodes from "@/lib/http-status-codes";
import {
  createErrorResponse,
  createGenericErrorResponse,
  createRateLimitErrorResponse,
  createServerErrorResponse,
  createSuccessResponse,
  getErrDetailsFromErrFields,
} from "@/lib/openapi";
import { authExamples, foldersExamples } from "@/lib/openapi-examples";

const tags = ["Folders"];

export const getFolderWithItemsDoc = describeRoute({
  description: "Get a folder with its items",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("Folder with items retrieved", {
      details: "Folder with items retrieved successfully",
      dataSchema: FolderWithItemsSchema,
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request data", {
      validationError: {
        summary: "Invalid request data",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields(authExamples.uuidValErr),
        fields: authExamples.uuidValErr,
      },
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.NOT_FOUND]: createGenericErrorResponse(
      "Folder not found",
      {
        code: "NOT_FOUND",
        details: "Folder not found",
      },
    ),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const createFolderDoc = describeRoute({
  description: "Create a new folder",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.CREATED]: createSuccessResponse("Folder created", {
      details: "Folder created successfully",
      dataSchema: FolderSelectSchema,
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request data", {
      validationError: {
        summary: "Invalid request data",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields(
          foldersExamples.createFolderValErrs,
        ),
        fields: foldersExamples.createFolderValErrs,
      },
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.NOT_FOUND]: createGenericErrorResponse(
      "Parent folder not found",
      {
        code: "NOT_FOUND",
        details: "Parent folder not found",
      },
    ),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const moveFolderDoc = describeRoute({
  description: "Move folder to another parent folder",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("Folder moved", {
      details: "Folder moved successfully",
      dataSchema: FolderSelectSchema,
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request data", {
      invalidFolderUUID: {
        summary: "Invalid folder ID",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields(authExamples.uuidValErr),
        fields: authExamples.uuidValErr,
      },
      invalidParentUUID: {
        summary: "Invalid parent folder ID",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields({
          parentFolderId: "Invalid UUID",
        }),
        fields: { parentFolderId: "Invalid UUID" },
      },
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.NOT_FOUND]: createErrorResponse(
      "Folder or parent folder not found",
      {
        folderNotFound: {
          summary: "Folder not found",
          code: "FOLDER_NOT_FOUND",
          details: "Folder not found",
        },
        parentNotFound: {
          summary: "Parent folder not found",
          code: "PARENT_FOLDER_NOT_FOUND",
          details: "Parent folder not found",
        },
      },
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: createErrorResponse(
      "Cannot move root folder or create cycles",
      {
        rootFolder: {
          summary: "Root folder cannot be moved",
          code: "ROOT_FOLDER",
          details: "Root folder cannot be moved",
        },
        folderCycle: {
          summary: "Folder cycle detected",
          code: "FOLDER_CYCLE",
          details: "Cannot move a folder into its own descendant or itself",
        },
      },
    ),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const updateFolderDoc = describeRoute({
  description: "Update an existing folder",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("Folder updated", {
      details: "Folder updated successfully",
      dataSchema: FolderSelectSchema,
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request data", {
      invalidFolderUUID: {
        summary: "Invalid folder ID",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields(authExamples.uuidValErr),
        fields: authExamples.uuidValErr,
      },
      validationError: {
        summary: "Invalid request data",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields(
          foldersExamples.createFolderValErrs,
        ),
        fields: foldersExamples.createFolderValErrs,
      },
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.NOT_FOUND]: createErrorResponse(
      "Folder or parent folder not found",
      {
        folderNotFound: {
          summary: "Folder not found",
          code: "FOLDER_NOT_FOUND",
          details: "Folder not found",
        },
        parentNotFound: {
          summary: "Parent folder not found",
          code: "PARENT_FOLDER_NOT_FOUND",
          details: "Parent folder not found",
        },
      },
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: createErrorResponse(
      "Cannot update root folder or create cycles",
      {
        rootFolder: {
          summary: "Root folder cannot be updated",
          code: "ROOT_FOLDER",
          details: "Root folder cannot be updated",
        },
        folderCycle: {
          summary: "Folder cycle detected",
          code: "FOLDER_CYCLE",
          details: "Cannot move a folder into its own descendant or itself",
        },
      },
    ),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const deleteFolderDoc = describeRoute({
  description: "Delete a folder",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("Folder deleted", {
      details: "Folder deleted successfully",
      dataSchema: FolderSelectSchema,
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request data", {
      invalidFolderUUID: {
        summary: "Invalid folder ID",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields(authExamples.uuidValErr),
        fields: authExamples.uuidValErr,
      },
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.NOT_FOUND]: createErrorResponse("Folder not found", {
      folderNotFound: {
        summary: "Folder not found",
        code: "NOT_FOUND",
        details: "Folder not found",
      },
    }),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: createErrorResponse(
      "Cannot delete root folder",
      {
        rootFolder: {
          summary: "Root folder cannot be deleted",
          code: "ROOT_FOLDER",
          details: "Root folder cannot be deleted",
        },
      },
    ),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const getFolderChildrenDoc = describeRoute({
  description:
    "Get direct children of a folder (folders and notes) with hasChildren hints for lazy loading",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("Folder children retrieved", {
      details: "Folder children retrieved successfully",
      dataSchema: FolderChildrenResponseSchema,
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request data", {
      validationError: {
        summary: "Invalid request data",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields(authExamples.uuidValErr),
        fields: authExamples.uuidValErr,
      },
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.NOT_FOUND]: createGenericErrorResponse(
      "Folder not found",
      {
        code: "NOT_FOUND",
        details: "Folder not found",
      },
    ),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const createRootFolderDoc = describeRoute({
  description: "Create root folder for authenticated user (used by auth hook)",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("Root folder already exists", {
      details: "Root folder already exists",
      dataSchema: FolderSelectSchema,
    }),
    [HttpStatusCodes.CREATED]: createSuccessResponse("Root folder created", {
      details: "Root folder created successfully",
      dataSchema: FolderSelectSchema,
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});
