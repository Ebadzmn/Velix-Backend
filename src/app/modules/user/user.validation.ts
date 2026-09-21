import { z } from 'zod';
import { ENUM_USER_ROLE } from '../../../enums/user';

const createUserZodSchema = z.object({
  body: z.object({
    firstName: z.string({
      message: 'First name is required',
    }),
    lastName: z.string({
      message: 'Last name is required',
    }),
    email: z
      .string({
        message: 'Email is required',
      })
      .email('Invalid email address'),
    password: z
      .string({
        message: 'Password is required',
      })
      .min(6, 'Password must be at least 6 characters long'),
    phoneNumber: z.string().optional(),
    country: z.string().optional(),
    currency: z.string().optional(),
    role: z.nativeEnum(ENUM_USER_ROLE).optional(),
    profileImage: z.string().optional(),
  }),
});

const updateUserZodSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
    country: z.string().optional(),
    currency: z.string().optional(),
    role: z.nativeEnum(ENUM_USER_ROLE).optional(),
    status: z.enum(['active', 'blocked']).optional(),
    profileImage: z.string().optional(),
  }),
});

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
};
