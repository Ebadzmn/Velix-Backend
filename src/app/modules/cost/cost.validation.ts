import { z } from 'zod';

const createCostZodSchema = z.object({
  body: z
    .object({
      title: z.string().optional(),
      name: z.string().optional(),
      amount: z.number({
        message: 'Amount must be a positive number',
      }).positive({
        message: 'Amount must be a positive number',
      }),
      category: z.string().optional(),
      category_id: z.string().optional(),
      date: z.string().optional(),
      note: z.string().optional(),
      currency: z.string().optional(),
    })
    .refine((data) => Boolean(data.title || data.name), {
      message: 'Title is required',
      path: ['title'],
    }),
});

const updateCostZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    name: z.string().optional(),
    amount: z.number().positive({ message: 'Amount must be a positive number' }).optional(),
    category: z.string().optional(),
    category_id: z.string().optional(),
    date: z.string().optional(),
    note: z.string().optional(),
    currency: z.string().optional(),
  }),
});

export const CostValidation = {
  createCostZodSchema,
  updateCostZodSchema,
};
