import { Model, Types } from 'mongoose';

export type IAppleSubscription = {
  _id?: Types.ObjectId | string;
  user: Types.ObjectId | string;
  originalTransactionId: string;
  latestTransactionId: string;
  productId: string;
  environment: 'Sandbox' | 'Production';
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'GRACE_PERIOD';
  purchaseDate: Date;
  expiresDate: Date;
  isAutoRenew: boolean;
  rawResponse?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
};

export type AppleSubscriptionModel = Model<IAppleSubscription, Record<string, unknown>>;
