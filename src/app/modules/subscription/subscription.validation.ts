import { z } from 'zod';

const createSubscriptionZodSchema = z.object({
  body: z
    .object({
      name: z.string({
        message: 'Name is required',
      }),
      price: z.number({
        message: 'Price must be a number',
      }),
      billing_period: z.enum(['monthly', 'yearly'], {
        message: 'Billing period must be monthly or yearly',
      }),
      currency: z.string({
        message: 'Currency is required',
      }),
      category: z.string().optional(),
      category_id: z.string().optional(),
    })
    .refine((data) => Boolean(data.category || data.category_id), {
      message: 'Category is required',
      path: ['category'],
    }),
});

const updateSubscriptionZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    price: z.number().optional(),
    billing_period: z.enum(['monthly', 'yearly']).optional(),
    currency: z.string().optional(),
    category: z.string().optional(),
    category_id: z.string().optional(),
  }),
});

export const SubscriptionValidation = {
  createSubscriptionZodSchema,
  updateSubscriptionZodSchema,
};
