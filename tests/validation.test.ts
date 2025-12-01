import { describe, it, expect } from 'vitest';
import { 
  createImageSchema, 
  updateImageSchema, 
  deleteImageSchema,
  createUserSchema,
  banUserSchema 
} from '../server/utils/validation';

describe('Validation Schemas', () => {
  
  describe('createImageSchema', () => {
    it('should validate correct image data', async () => {
      const validData = {
        file_name: 'test.jpg',
        file_path: 'user/test.jpg',
        file_size: 1024
      };
      const result = await createImageSchema.parseAsync(validData);
      expect(result).toEqual(validData);
    });

    it('should reject missing fields', async () => {
      const invalidData = {
        file_name: 'test.jpg'
      };
      await expect(createImageSchema.parseAsync(invalidData)).rejects.toThrow();
    });
  });

  describe('updateImageSchema', () => {
    it('should validate correct update data', async () => {
      const validData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        file_name: 'new_name.jpg'
      };
      const result = await updateImageSchema.parseAsync(validData);
      expect(result).toEqual(validData);
    });

    it('should reject invalid uuid', async () => {
      const invalidData = {
        id: 'not-a-uuid',
        file_name: 'new_name.jpg'
      };
      await expect(updateImageSchema.parseAsync(invalidData)).rejects.toThrow();
    });
  });

  describe('createUserSchema', () => {
    it('should validate correct user data', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };
      const result = await createUserSchema.parseAsync(validData);
      expect(result).toEqual(validData);
    });

    it('should reject invalid email', async () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123'
      };
      await expect(createUserSchema.parseAsync(invalidData)).rejects.toThrow();
    });

    it('should reject short password', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123'
      };
      await expect(createUserSchema.parseAsync(invalidData)).rejects.toThrow();
    });
  });

  describe('banUserSchema', () => {
    it('should validate correct ban data', async () => {
      const validData = {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        is_banned: true
      };
      const result = await banUserSchema.parseAsync(validData);
      expect(result).toEqual(validData);
    });
  });
});
