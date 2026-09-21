import { z } from 'zod';

const createPopularServiceZodSchema = z.object({
  body: z.object({
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
    category_id: z.string({
      message: 'Category ID is required',
    }),
    logo: z.string().optional(),
    description: z.string().optional(),
  }),
});

const updatePopularServiceZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    price: z.number().optional(),
    billing_period: z.enum(['monthly', 'yearly']).optional(),
    currency: z.string().optional(),
    category_id: z.string().optional(),
    logo: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const PopularServiceValidation = {
  createPopularServiceZodSchema,
  updatePopularServiceZodSchema,
};
