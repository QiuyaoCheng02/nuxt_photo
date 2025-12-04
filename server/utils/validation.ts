import { z } from 'zod';
//validate data from client meet the schema
export const createImageSchema = z.object({
  file_name: z.string().min(1),
  file_path: z.string().min(1),
  file_size: z.number().positive(),
});

export const updateImageSchema = z.object({
  id: z.string().uuid(),
  file_name: z.string().min(1),
});

export const deleteImageSchema = z.object({
  id: z.string().uuid(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const banUserSchema = z.object({
  user_id: z.string().uuid(),
  is_banned: z.boolean(),
});
