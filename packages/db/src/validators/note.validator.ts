import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { note } from "../schemas/note.schema";

export const EncryptedNoteSelectSchema = createSelectSchema(note).extend({
  createdAt: z.number().transform((n) => new Date(n)),
  updatedAt: z.number().transform((n) => new Date(n)),
  deletedAt: z
    .number()
    .transform((n) => new Date(n))
    .nullable(),
});

export const NoteSelectSchema = EncryptedNoteSelectSchema.omit({
  contentEncrypted: true,
  contentIv: true,
  contentTag: true,
}).extend({
  content: z.string(),
});

// Note metadata without content (for folder children listing)
export const NoteMetadataSchema = EncryptedNoteSelectSchema.omit({
  contentEncrypted: true,
  contentIv: true,
  contentTag: true,
});

export const NoteInsertSchema = createInsertSchema(note)
  .pick({
    title: true,
    isFavorite: true,
    folderId: true,
  })
  .extend({
    title: z.string().min(1).default("Untitled"),
    content: z.string().default(""),
    isFavorite: z.boolean().default(false),
    folderId: z.uuid(),
  });

export const NoteUpdateSchema = NoteInsertSchema.extend({
  title: z.string().min(1),
  isFavorite: z.boolean(),
  _compressed: z.boolean(),
}).partial();

export type DecryptedNote = z.infer<typeof NoteSelectSchema>;
export type NoteMetadata = z.infer<typeof NoteMetadataSchema>;
