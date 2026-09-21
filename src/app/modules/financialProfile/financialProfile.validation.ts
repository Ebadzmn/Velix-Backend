import { z } from 'zod';

const fixedCostZodSchema = z.object({
  category: z.string({
    message: 'Category is required',
  }),
  amount: z.number({
    message: 'Amount must be a number',
  }),
});

const subscriptionItemSchema = z.union([
  z.string(),
  z.object({
    name: z.string(),
    price: z.number().optional(),
    billing_period: z.enum(['monthly', 'yearly']).optional(),
    category: z.string().optional(),
    currency: z.string().optional(),
  }),
]);

const createOrUpdateFinancialProfileZodSchema = z.object({
  body: z.object({
    monthlySalary: z.number({
      message: 'Monthly salary must be a number',
    }),
    otherIncome: z.number().optional().default(0),
    subscriptions: z.array(subscriptionItemSchema).optional().default([]),
    fixedCosts: z.array(fixedCostZodSchema).optional().default([]),
    monthlySavings: z.number({
      message: 'Monthly savings must be a number',
    }),
    savingsGoal: z.string({
      message: 'Savings goal is required',
    }),
  }),
});

export const FinancialProfileValidation = {
  createOrUpdateFinancialProfileZodSchema,
};
