import { z } from 'zod';

const updateNotificationPreferencesZodSchema = z.object({
  body: z.object({
    renewalReminders: z.boolean().optional(),
    priceIncreases: z.boolean().optional(),
    unusedSubscriptions: z.boolean().optional(),
    budgetAlerts: z.boolean().optional(),
    savingsReminders: z.boolean().optional(),
    weeklyReport: z.boolean().optional(),
    monthlyReport: z.boolean().optional(),
    pushEnabled: z.boolean().optional(),
    emailEnabled: z.boolean().optional(),
  }),
});

const registerDeviceTokenZodSchema = z.object({
  body: z.object({
    fcmToken: z.string({
      required_error: 'FCM Token is required',
    }),
    deviceType: z.enum(['android', 'ios', 'web'], {
      required_error: 'Device type is required (android, ios, or web)',
    }),
  }),
});

export const NotificationValidation = {
  updateNotificationPreferencesZodSchema,
  registerDeviceTokenZodSchema,
};
