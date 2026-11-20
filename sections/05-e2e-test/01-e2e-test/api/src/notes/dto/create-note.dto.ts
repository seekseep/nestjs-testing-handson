import { z } from 'zod';

/** メモを作るときに受け取る値。本文は省略すると空になる。 */
export const createNoteSchema = z.strictObject({
  title: z.string().trim().min(1).max(100),
  body: z.string().max(1000).default(''),
});

export type CreateNoteDto = z.infer<typeof createNoteSchema>;
