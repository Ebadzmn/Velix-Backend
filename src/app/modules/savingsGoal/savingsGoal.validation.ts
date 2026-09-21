import { z } from 'zod';

const createSavingsGoalZodSchema = z.object({
  body: z.object({
    name: z.string({
      message: 'Name is required',
    }),
    target_amount: z.number({
      message: 'Target amount must be a number',
    }),
    saved_amount: z.number().optional().default(0),
    target_date: z.string().optional(),
    currency: z.string().optional(),
    is_active: z.boolean().optional(),
  }),
});

const updateSavingsGoalZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    target_amount: z.number().optional(),
    saved_amount: z.number().optional(),
    target_date: z.string().optional(),
    currency: z.string().optional(),
    is_active: z.boolean().optional(),
  }),
});

export const SavingsGoalValidation = {
  createSavingsGoalZodSchema,
  updateSavingsGoalZodSchema,
};
