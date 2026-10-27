import { z } from 'zod';

export const createStudyFileSchema = z.object({
  title: z.string().trim().min(1, 'Tiêu đề không được để trống').max(200),
  content: z.string().trim().min(1, 'Nội dung không được để trống').max(100_000),
});

export type CreateStudyFileInput = z.infer<typeof createStudyFileSchema>;
