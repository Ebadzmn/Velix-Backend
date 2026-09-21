import { z } from 'zod';

const createIncomeZodSchema = z.object({
  body: z.object({
    title: z.string({
      message: 'Title is required',
    }),
    amount: z.number({
      message: 'Amount must be a number',
    }),
    date: z.string().optional(),
    note: z.string().optional(),
  }),
});

const updateIncomeZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    amount: z.number().optional(),
    date: z.string().optional(),
    note: z.string().optional(),
  }),
});

export const IncomeValidation = {
  createIncomeZodSchema,
  updateIncomeZodSchema,
};
