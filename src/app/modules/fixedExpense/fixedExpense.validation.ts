import { z } from 'zod';

const createFixedExpenseZodSchema = z.object({
  body: z.object({
    title: z.string({
      message: 'Title is required',
    }),
    amount: z.number({
      message: 'Amount must be a number',
    }),
    category: z.string().optional(),
    frequency: z.enum(['monthly', 'yearly']).optional(),
  }),
});

const updateFixedExpenseZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    amount: z.number().optional(),
    category: z.string().optional(),
    frequency: z.enum(['monthly', 'yearly']).optional(),
  }),
});

export const FixedExpenseValidation = {
  createFixedExpenseZodSchema,
  updateFixedExpenseZodSchema,
};
