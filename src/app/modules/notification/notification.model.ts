import { Schema, model } from 'mongoose';
import {
  DeviceTokenModel,
  IDeviceToken,
  INotification,
  INotificationPreference,
  NotificationModel,
  NotificationPreferenceModel,
} from './notification.interface';

// 1. Notification Preference Schema
const notificationPreferenceSchema = new Schema<
  INotificationPreference,
  NotificationPreferenceModel
>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    renewalReminders: {
      type: Boolean,
      default: true,
    },
    priceIncreases: {
      type: Boolean,
      default: true,
    },
    unusedSubscriptions: {
      type: Boolean,
      default: true,
    },
    budgetAlerts: {
      type: Boolean,
      default: false,
    },
    savingsReminders: {
      type: Boolean,
      default: false,
    },
    weeklyReport: {
      type: Boolean,
      default: false,
    },
    monthlyReport: {
      type: Boolean,
      default: false,
    },
    pushEnabled: {
      type: Boolean,
      default: true,
    },
    emailEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret: Record<string, unknown>) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const NotificationPreference = model<
  INotificationPreference,
  NotificationPreferenceModel
>('NotificationPreference', notificationPreferenceSchema);

// 2. Notification Item Schema
const notificationSchema = new Schema<INotification, NotificationModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'renewal',
        'price_increase',
        'unused_sub',
        'budget_alert',
        'savings_goal',
        'report',
        'system',
      ],
      default: 'system',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Notification = model<INotification, NotificationModel>(
  'Notification',
  notificationSchema
);

// 3. Device Token Schema
const deviceTokenSchema = new Schema<IDeviceToken, DeviceTokenModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fcmToken: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    deviceType: {
      type: String,
      enum: ['android', 'ios', 'web'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const DeviceToken = model<IDeviceToken, DeviceTokenModel>(
  'DeviceToken',
  deviceTokenSchema
);
