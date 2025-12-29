import {
  EncryptedNoteSelectSchema,
  NoteSelectSchema,
} from "@repo/db/validators/note.validator";
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
import { authExamples, notesExamples } from "@/lib/openapi-examples";

const tags = ["Notes"];

export const getAllNotesDoc = describeRoute({
  description: "Get all notes for the current user",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("All notes retrieved", {
      details: "All notes retrieved successfully",
      dataSchema: z.array(EncryptedNoteSelectSchema),
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const createNoteDoc = describeRoute({
  description: "Create a new note",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.CREATED]: createSuccessResponse("Note created", {
      details: "Note created successfully",
      dataSchema: EncryptedNoteSelectSchema,
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request data", {
      validationError: {
        summary: "Invalid request data",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields(notesExamples.createNoteValErrs),
        fields: notesExamples.createNoteValErrs,
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
    [HttpStatusCodes.REQUEST_TOO_LONG]: createGenericErrorResponse(
      "Payload too large",
      {
        code: "PAYLOAD_TOO_LARGE",
        details: "Note content exceeds 2MB limit",
      },
    ),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const getSingleNoteDoc = describeRoute({
  description: "Get a single note for the current user",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("Note retrieved", {
      details: "Note retrieved successfully",
      dataSchema: NoteSelectSchema,
    }),
    [HttpStatusCodes.NOT_MODIFIED]: {
      description: "Note not modified",
    },
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
    [HttpStatusCodes.NOT_FOUND]: createGenericErrorResponse("Note not found", {
      code: "NOT_FOUND",
      details: "Note not found",
    }),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const copyNoteDoc = describeRoute({
  description: "Make a copy of a note",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.CREATED]: createSuccessResponse("Note copied", {
      details: "Note copied successfully",
      dataSchema: EncryptedNoteSelectSchema,
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
    [HttpStatusCodes.NOT_FOUND]: createGenericErrorResponse("Note not found", {
      code: "NOT_FOUND",
      details: "Note not found",
    }),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const toggleNoteFavoriteDoc = describeRoute({
  description: "Favorite or unfavorite a note",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("Note favorite state updated", {
      details: "Note favorite state updated successfully",
      dataSchema: EncryptedNoteSelectSchema,
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request data", {
      invalidUUID: {
        summary: "Invalid note ID",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields(authExamples.uuidValErr),
        fields: authExamples.uuidValErr,
      },
      invalidInput: {
        summary: "Invalid request data",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields(notesExamples.favoriteNoteValErrs),
        fields: notesExamples.favoriteNoteValErrs,
      },
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.NOT_FOUND]: createGenericErrorResponse("Note not found", {
      code: "NOT_FOUND",
      details: "Note not found",
    }),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const moveNoteDoc = describeRoute({
  description: "Move note to another folder",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("Note moved", {
      details: "Note moved successfully",
      dataSchema: EncryptedNoteSelectSchema,
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request data", {
      invalidNoteUUID: {
        summary: "Invalid note ID",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields(authExamples.uuidValErr),
        fields: authExamples.uuidValErr,
      },
      invalidFolderUUID: {
        summary: "Invalid folder ID",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields({
          folderId: authExamples.uuidValErr.id,
        }),
        fields: { folderId: authExamples.uuidValErr.id },
      },
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.NOT_FOUND]: createErrorResponse(
      "Note or folder not found",
      {
        noteNotFound: {
          summary: "Note not found",
          code: "NOTE_NOT_FOUND",
          details: "Note not found",
        },
        folderNotFound: {
          summary: "Folder not found",
          code: "FOLDER_NOT_FOUND",
          details: "Folder not found",
        },
      },
    ),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const updateNoteDoc = describeRoute({
  description: "Update all editable fields of a note",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("Note updated", {
      details: "Note updated successfully",
      dataSchema: NoteSelectSchema,
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request data", {
      invalidNoteUUID: {
        summary: "Invalid note ID",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields(authExamples.uuidValErr),
        fields: authExamples.uuidValErr,
      },
      validationError: {
        summary: "Invalid request data",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields(notesExamples.createNoteValErrs),
        fields: notesExamples.createNoteValErrs,
      },
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.NOT_FOUND]: createErrorResponse(
      "Note or folder not found",
      {
        noteNotFound: {
          summary: "Note not found",
          code: "NOTE_NOT_FOUND",
          details: "Note not found",
        },
        folderNotFound: {
          summary: "Folder not found",
          code: "FOLDER_NOT_FOUND",
          details: "Folder not found",
        },
      },
    ),
    [HttpStatusCodes.PRECONDITION_FAILED]: createGenericErrorResponse(
      "Note was modified",
      {
        code: "PRECONDITION_FAILED",
        details:
          "Note was modified by another request. Please refresh and try again.",
      },
    ),
    [HttpStatusCodes.REQUEST_TOO_LONG]: createGenericErrorResponse(
      "Payload too large",
      {
        code: "PAYLOAD_TOO_LARGE",
        details: "Note content exceeds 2MB limit",
      },
    ),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});

export const deleteNoteDoc = describeRoute({
  description: "Delete a note",
  tags,
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    [HttpStatusCodes.OK]: createSuccessResponse("Note deleted", {
      details: "Note deleted successfully",
      dataSchema: EncryptedNoteSelectSchema,
    }),
    [HttpStatusCodes.BAD_REQUEST]: createErrorResponse("Invalid request data", {
      invalidUUID: {
        summary: "Invalid note ID",
        code: "INVALID_DATA",
        details: getErrDetailsFromErrFields(authExamples.uuidValErr),
        fields: authExamples.uuidValErr,
      },
    }),
    [HttpStatusCodes.UNAUTHORIZED]: createGenericErrorResponse("Unauthorized", {
      code: "UNAUTHORIZED",
      details: "No session found",
    }),
    [HttpStatusCodes.NOT_FOUND]: createGenericErrorResponse("Note not found", {
      code: "NOT_FOUND",
      details: "Note not found",
    }),
    [HttpStatusCodes.TOO_MANY_REQUESTS]: createRateLimitErrorResponse(),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: createServerErrorResponse(),
  },
});
