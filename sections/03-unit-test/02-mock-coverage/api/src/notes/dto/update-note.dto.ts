import { z } from 'zod';

/**
 * メモを書き換えるときに受け取る値。どの項目も省略できる。
 * createNoteSchema.partial() にすると、本文の default('') が効いて
 * 「タイトルだけ変えたのに本文が消える」ので、既定値なしで別に書く。
 */
export const updateNoteSchema = z.strictObject({
  title: z.string().trim().min(1).max(100).optional(),
  body: z.string().max(1000).optional(),
});

export type UpdateNoteDto = z.infer<typeof updateNoteSchema>;
