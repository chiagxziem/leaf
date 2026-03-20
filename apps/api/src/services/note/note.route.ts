import { validator } from "hono-openapi";
import { streamSSE } from "hono/streaming";
import { ungzip } from "pako";
import { z } from "zod";

import { db, eq } from "@repo/db";
import { type Note, note } from "@repo/db/schemas/note.schema";
import {
  NoteInsertSchema,
  NoteUpdateSchema,
} from "@repo/db/validators/note.validator";

import { createRouter } from "@/app";
import { decryptContent, encryptContent } from "@/lib/encryption";
import { noteEvents } from "@/lib/events";
import HttpStatusCodes from "@/lib/http-status-codes";
import { errorResponse, successResponse } from "@/lib/utils";
import { authed } from "@/middleware/authed";
import { validationHook } from "@/middleware/validation-hook";
import { getFolderForUser } from "@/queries/folder-queries";
import {
  generateUniqueNoteTitle,
  getNoteForUser,
} from "@/queries/note-queries";
import type { EncryptedNote } from "@/types";

import {
  copyNoteDoc,
  createNoteDoc,
  deleteNoteDoc,
  getAllNotesDoc,
  getSingleNoteDoc,
  moveNoteDoc,
  toggleNoteFavoriteDoc,
  updateNoteDoc,
} from "./note.docs";

const noteRouter = createRouter().use(authed);

// Content size limits
const MAX_CONTENT_SIZE_BYTES = 2 * 1024 * 1024; // 2MB uncompressed

// Helper to get byte size of a string
const getByteSize = (str: string): number => {
  return new TextEncoder().encode(str).length;
};

// Helper for decompressing note content
const decompressContent = (data: any): string | undefined => {
  if (!data.content) return data.content;

  // Check if content was compressed
  if (data._compressed === true) {
    try {
      // Decode base64 using Buffer
      const buffer = Buffer.from(data.content, "base64");

      // Decompress
      const decompressed = ungzip(buffer, { to: "string" });
      return decompressed;
    } catch (error) {
      console.error("Failed to decompress content:", error);
      throw new Error("Invalid compressed content", { cause: error });
    }
  }

  return data.content;
};

// Realtime SSE endpoint
noteRouter.get("/sse", async (c) => {
  const user = c.get("user");

  return streamSSE(c, async (stream) => {
    const listener = (data: { type: string; id: string; userId: string }) => {
      if (data.userId === user.id) {
        stream.writeSSE({
          data: JSON.stringify({ type: data.type, id: data.id }),
          event: "data-change",
        });
      }
    };

    noteEvents.on("data-change", listener);

    stream.onAbort(() => {
      noteEvents.off("data-change", listener);
    });

    // Heartbeat to keep connection alive
    const sendHeartbeat = async () => {
      try {
        while (true) {
          // oxlint-disable-next-line no-await-in-loop
          await stream.sleep(30000);
          // oxlint-disable-next-line no-await-in-loop
          await stream.writeSSE({ data: "heartbeat", event: "ping" });
        }
      } catch {
        // Stream most likely closed
      }
    };

    // Start heartbeat in background
    void sendHeartbeat();
  });
});

// Get all notes
noteRouter.get("/", getAllNotesDoc, async (c) => {
  try {
    const notes = await db.query.note.findMany();

    return c.json(
      successResponse(notes, "All notes retrieved successfully"),
      HttpStatusCodes.OK,
    );
  } catch (error) {
    console.error("Error retrieving notes:", error);
    return c.json(
      errorResponse("INTERNAL_SERVER_ERROR", "Failed to retrieve notes"),
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
});

// Create note
noteRouter.post(
  "/",
  createNoteDoc,
  validator("json", NoteInsertSchema, validationHook),
  async (c) => {
    const user = c.get("user");
    const noteData = c.req.valid("json");

    try {
      // Decompress content if needed
      const decompressedContent = decompressContent(noteData);

      // Check content size limit
      if (
        decompressedContent &&
        getByteSize(decompressedContent) > MAX_CONTENT_SIZE_BYTES
      ) {
        return c.json(
          errorResponse("PAYLOAD_TOO_LARGE", "Note content exceeds 2MB limit"),
          HttpStatusCodes.REQUEST_TOO_LONG,
        );
      }

      const folder = await getFolderForUser(noteData.folderId, user.id);

      if (!folder) {
        return c.json(
          errorResponse("NOT_FOUND", "Folder not found"),
          HttpStatusCodes.NOT_FOUND,
        );
      }

      const uniqueTitle = await generateUniqueNoteTitle(
        noteData.title || "untitled",
        user.id,
        noteData.folderId,
      );

      let encryptedData: EncryptedNote = {
        contentEncrypted: "",
        contentIv: "",
        contentTag: "",
      };

      const contentToEncrypt = decompressedContent || noteData.content;
      if (contentToEncrypt) {
        const { encrypted, iv, tag } = encryptContent(contentToEncrypt);
        encryptedData = {
          contentEncrypted: encrypted,
          contentIv: iv,
          contentTag: tag,
        };
      }

      const { content: _, ...rest } = noteData;

      const payload = {
        ...rest,
        ...encryptedData,
        userId: user.id,
        title: uniqueTitle,
      };

      const [newNote] = await db.insert(note).values(payload).returning();

      // Emit realtime update event
      console.log(`[SSE] Emitting note-created for note ${newNote.id}`);
      noteEvents.emit("data-change", {
        type: "note",
        id: newNote.id,
        userId: user.id,
      });

      return c.json(
        successResponse(newNote, "Note created successfully"),
        HttpStatusCodes.CREATED,
      );
    } catch (error) {
      console.error("Error creating note:", error);
      return c.json(
        errorResponse("INTERNAL_SERVER_ERROR", "Failed to create note"),
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

// Get single note
noteRouter.get(
  "/:id",
  getSingleNoteDoc,
  validator("param", z.object({ id: z.uuid() }), validationHook),
  async (c) => {
    const user = c.get("user");
    const { id } = c.req.valid("param");

    try {
      const foundNote = await getNoteForUser(id, user.id);

      if (!foundNote) {
        return c.json(
          errorResponse("NOT_FOUND", "Note not found"),
          HttpStatusCodes.NOT_FOUND,
        );
      }

      // Generate ETag from updatedAt timestamp
      const etag = `"${foundNote.updatedAt.getTime()}"`;

      // Check If-None-Match header for conditional request
      const ifNoneMatch = c.req.header("If-None-Match");
      if (ifNoneMatch === etag) {
        return c.body(null, HttpStatusCodes.NOT_MODIFIED);
      }

      const decryptedNote: Omit<
        Note,
        "contentEncrypted" | "contentIv" | "contentTag"
      > & {
        content: string;
      } = {
        id: foundNote.id,
        title: foundNote.title,
        content: "",
        folderId: foundNote.folderId,
        userId: foundNote.userId,
        isFavorite: foundNote.isFavorite,
        deletedAt: foundNote.deletedAt,
        createdAt: foundNote.createdAt,
        updatedAt: foundNote.updatedAt,
      };

      if (
        foundNote.contentEncrypted &&
        foundNote.contentIv &&
        foundNote.contentTag
      ) {
        decryptedNote.content = decryptContent(
          foundNote.contentEncrypted,
          foundNote.contentIv,
          foundNote.contentTag,
        );
      }

      // Set ETag header for caching
      c.header("ETag", etag);

      return c.json(
        successResponse(decryptedNote, "Note retrieved successfully"),
        HttpStatusCodes.OK,
      );
    } catch (error) {
      console.error("Error retrieving note:", error);
      return c.json(
        errorResponse("INTERNAL_SERVER_ERROR", "Failed to retrieve note"),
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

// Copy note
noteRouter.get(
  "/:id/copy",
  copyNoteDoc,
  validator("param", z.object({ id: z.uuid() }), validationHook),
  async (c) => {
    const user = c.get("user");
    const { id } = c.req.valid("param");

    try {
      const noteToBeCopied = await getNoteForUser(id, user.id);

      // Check if the note exists
      if (!noteToBeCopied) {
        return c.json(
          errorResponse("NOTE_NOT_FOUND", "Note not found"),
          HttpStatusCodes.NOT_FOUND,
        );
      }

      const uniqueTitle = await generateUniqueNoteTitle(
        noteToBeCopied.title || "untitled",
        user.id,
        noteToBeCopied.folderId,
      );

      // Decrypt the content of the original note
      const decryptedContent = noteToBeCopied.contentEncrypted
        ? decryptContent(
            noteToBeCopied.contentEncrypted,
            noteToBeCopied.contentIv,
            noteToBeCopied.contentTag,
          )
        : "";

      // Encrypt the content for the new note
      const { encrypted, iv, tag } = encryptContent(decryptedContent);

      const payload = {
        title: uniqueTitle,
        contentEncrypted: encrypted,
        contentIv: iv,
        contentTag: tag,
        userId: user.id,
        folderId: noteToBeCopied.folderId,
        isFavorite: false,
      };

      const [copiedNote] = await db.insert(note).values(payload).returning();

      // Emit realtime update event
      console.log(`[SSE] Emitting note-copied for note ${copiedNote.id}`);
      noteEvents.emit("data-change", {
        type: "note",
        id: copiedNote.id,
        userId: user.id,
      });

      return c.json(
        successResponse(copiedNote, "Note copied successfully"),
        HttpStatusCodes.CREATED,
      );
    } catch (error) {
      console.error("Error copying note:", error);
      return c.json(
        errorResponse("INTERNAL_SERVER_ERROR", "Failed to copy note"),
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

// Toggle favorite
noteRouter.patch(
  "/:id/favorite",
  toggleNoteFavoriteDoc,
  validator("param", z.object({ id: z.uuid() }), validationHook),
  validator(
    "json",
    z.object({
      favorite: z.boolean(),
    }),
    validationHook,
  ),
  async (c) => {
    const user = c.get("user");
    const { id } = c.req.valid("param");
    const { favorite } = c.req.valid("json");

    try {
      const foundNote = await getNoteForUser(id, user.id);

      if (!foundNote) {
        return c.json(
          errorResponse("NOT_FOUND", "Note not found"),
          HttpStatusCodes.NOT_FOUND,
        );
      }

      const [updatedNote] = await db
        .update(note)
        .set({ isFavorite: favorite })
        .where(eq(note.id, id))
        .returning();

      // Emit realtime update event
      console.log(`[SSE] Emitting note-favorited for note ${id}`);
      noteEvents.emit("data-change", { type: "note", id: id, userId: user.id });

      return c.json(
        successResponse(
          updatedNote,
          "Note favorite state updated successfully",
        ),
        HttpStatusCodes.OK,
      );
    } catch (error) {
      console.error("Error updating note favorite state:", error);
      return c.json(
        errorResponse(
          "INTERNAL_SERVER_ERROR",
          "Failed to update note favorite state",
        ),
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

// Move note
noteRouter.patch(
  "/:id/move",
  moveNoteDoc,
  validator("param", z.object({ id: z.uuid() }), validationHook),
  validator(
    "json",
    z.object({
      folderId: z.uuid(),
    }),
    validationHook,
  ),
  async (c) => {
    const user = c.get("user");
    const { id } = c.req.valid("param");
    const { folderId } = c.req.valid("json");

    try {
      const foundNote = await getNoteForUser(id, user.id);

      if (!foundNote) {
        return c.json(
          errorResponse("NOTE_NOT_FOUND", "Note not found"),
          HttpStatusCodes.NOT_FOUND,
        );
      }

      if (folderId === foundNote.folderId) {
        return c.json(
          successResponse(foundNote, "Note moved successfully"),
          HttpStatusCodes.OK,
        );
      }

      const folder = await getFolderForUser(folderId, user.id);
      if (!folder) {
        return c.json(
          errorResponse("FOLDER_NOT_FOUND", "Folder not found"),
          HttpStatusCodes.NOT_FOUND,
        );
      }

      const uniqueTitle = await generateUniqueNoteTitle(
        foundNote.title,
        user.id,
        folderId,
      );

      const [updatedNote] = await db
        .update(note)
        .set({ folderId, title: uniqueTitle })
        .where(eq(note.id, id))
        .returning();

      // Emit realtime update event
      console.log(`[SSE] Emitting note-moved for note ${id}`);
      noteEvents.emit("data-change", { type: "note", id: id, userId: user.id });
      // Also notify that folder content changed
      noteEvents.emit("data-change", {
        type: "folder",
        id: folderId,
        userId: user.id,
      });

      return c.json(
        successResponse(updatedNote, "Note moved successfully"),
        HttpStatusCodes.OK,
      );
    } catch (error) {
      console.error("Error moving note:", error);
      return c.json(
        errorResponse("INTERNAL_SERVER_ERROR", "Failed to move note"),
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

// Update note
noteRouter.put(
  "/:id",
  updateNoteDoc,
  validator("param", z.object({ id: z.uuid() }), validationHook),
  validator("json", NoteUpdateSchema, validationHook),
  async (c) => {
    const user = c.get("user");
    const { id } = c.req.valid("param");
    const noteData = c.req.valid("json");

    try {
      const foundNote = await getNoteForUser(id, user.id);

      if (!foundNote) {
        return c.json(
          errorResponse("NOTE_NOT_FOUND", "Note not found"),
          HttpStatusCodes.NOT_FOUND,
        );
      }

      // Check If-Match header for optimistic locking (prevents conflicts)
      const ifMatch = c.req.header("If-Match");
      if (ifMatch) {
        const currentEtag = `"${foundNote.updatedAt.getTime()}"`;
        if (ifMatch !== currentEtag) {
          // Note was modified since client last fetched it
          return c.json(
            errorResponse(
              "PRECONDITION_FAILED",
              "Note was modified by another request. Please refresh and try again.",
            ),
            HttpStatusCodes.PRECONDITION_FAILED,
          );
        }
      }

      const folderId = noteData.folderId ?? foundNote.folderId;
      const title = noteData.title ?? foundNote.title;
      const isFavorite = noteData.isFavorite ?? foundNote.isFavorite;

      if (folderId !== foundNote.folderId) {
        const folder = await getFolderForUser(folderId, user.id);
        if (!folder) {
          return c.json(
            errorResponse("FOLDER_NOT_FOUND", "Folder not found"),
            HttpStatusCodes.NOT_FOUND,
          );
        }
      }

      // Decompress content if needed
      const content = decompressContent(noteData);

      // Check content size limit
      if (content && getByteSize(content) > MAX_CONTENT_SIZE_BYTES) {
        return c.json(
          errorResponse("PAYLOAD_TOO_LARGE", "Note content exceeds 2MB limit"),
          HttpStatusCodes.REQUEST_TOO_LONG,
        );
      }

      // Only build encrypted fields if new raw content is provided.
      let encryptedData: Partial<EncryptedNote> = {};
      if ("content" in noteData) {
        if (content && content.length > 0) {
          const { encrypted, iv, tag } = encryptContent(content);
          encryptedData = {
            contentEncrypted: encrypted,
            contentIv: iv,
            contentTag: tag,
          };
        }
      }

      let newTitle = title;
      if (folderId !== foundNote.folderId || title !== foundNote.title) {
        newTitle = await generateUniqueNoteTitle(title, user.id, folderId);
      }

      const updatePayload = {
        folderId,
        title: newTitle,
        isFavorite,
        ...encryptedData,
      };

      const [updatedNote] = await db
        .update(note)
        .set(updatePayload)
        .where(eq(note.id, id))
        .returning();

      const decryptedUpdatedNote: Omit<
        Note,
        "contentEncrypted" | "contentIv" | "contentTag"
      > & {
        content: string;
      } = {
        id: updatedNote.id,
        title: updatedNote.title,
        content: "",
        folderId: updatedNote.folderId,
        userId: updatedNote.userId,
        isFavorite: updatedNote.isFavorite,
        deletedAt: updatedNote.deletedAt,
        createdAt: updatedNote.createdAt,
        updatedAt: updatedNote.updatedAt,
      };

      // Set ETag header for caching
      c.header("ETag", `"${updatedNote.updatedAt.getTime()}"`);

      // Emit realtime update event
      console.log(`[SSE] Emitting note-updated for note ${id}`);
      noteEvents.emit("data-change", { type: "note", id: id, userId: user.id });

      return c.json(
        successResponse(decryptedUpdatedNote, "Note updated successfully"),
        HttpStatusCodes.OK,
      );
    } catch (error) {
      console.error("Error updating note:", error);
      return c.json(
        errorResponse("INTERNAL_SERVER_ERROR", "Failed to update note"),
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

// Delete note
noteRouter.delete(
  "/:id",
  deleteNoteDoc,
  validator("param", z.object({ id: z.uuid() }), validationHook),
  async (c) => {
    const user = c.get("user");
    const { id } = c.req.valid("param");

    try {
      const foundNote = await getNoteForUser(id, user.id);

      if (!foundNote) {
        return c.json(
          errorResponse("NOTE_NOT_FOUND", "Note not found"),
          HttpStatusCodes.NOT_FOUND,
        );
      }

      // Soft delete: set deletedAt timestamp instead of hard delete
      const [deletedNote] = await db
        .update(note)
        .set({ deletedAt: new Date() })
        .where(eq(note.id, id))
        .returning();

      // Emit realtime update event
      console.log(`[SSE] Emitting note-deleted for note ${id}`);
      noteEvents.emit("data-change", { type: "note", id: id, userId: user.id });

      return c.json(
        successResponse(deletedNote, "Note deleted successfully"),
        HttpStatusCodes.OK,
      );
    } catch (error) {
      console.error("Error deleting note:", error);
      return c.json(
        errorResponse("INTERNAL_SERVER_ERROR", "Failed to delete note"),
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

export default noteRouter;
