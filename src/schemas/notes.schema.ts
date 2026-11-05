import { z } from "zod";
export type CreateNoteInput = z.infer<typeof createNoteSchema>;   // { text: string }
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;   // { text?: string }
export type ListQuery = z.infer<typeof listQuerySchema>;          // { limit: number;

export const createNoteSchema = z.strictObject({
  text: z
    .string()
    .trim()
    .min(1, "Text is required")
    .max(500, "Text is too long"),
});

export const idParamSchema = z.object({
  id: z.uuid(),
});

export const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(2),
  offset: z.coerce.number().int().min(0).default(0),
  q: z.string().trim().min(1).optional(),
});

export const updateNoteSchema = createNoteSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );
