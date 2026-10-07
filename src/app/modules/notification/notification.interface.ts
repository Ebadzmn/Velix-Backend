import { Model, Types } from 'mongoose';

export type INotificationPreference = {
  _id?: Types.ObjectId | string;
  user: Types.ObjectId | string;
  renewalReminders: boolean;
  priceIncreases: boolean;
  unusedSubscriptions: boolean;
  budgetAlerts: boolean;
  savingsReminders: boolean;
  weeklyReport: boolean;
  monthlyReport: boolean;
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type NotificationPreferenceModel = Model<INotificationPreference>;

export type INotificationType =
  | 'renewal'
  | 'price_increase'
  | 'unused_sub'
  | 'budget_alert'
  | 'savings_goal'
  | 'report'
  | 'system';

export type INotification = {
  _id?: Types.ObjectId | string;
  user: Types.ObjectId | string;
  title: string;
  message: string;
  type: INotificationType;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
};

export type NotificationModel = Model<INotification>;

export type IDeviceToken = {
  _id?: Types.ObjectId | string;
  user: Types.ObjectId | string;
  fcmToken: string;
  deviceType: 'android' | 'ios' | 'web';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type DeviceTokenModel = Model<IDeviceToken>;
