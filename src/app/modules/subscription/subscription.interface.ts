import { Model, Types } from 'mongoose';

export type IBillingPeriod = 'monthly' | 'yearly';

export type ISubscription = {
  _id?: Types.ObjectId | string;
  user: Types.ObjectId | string;
  name: string;
  price: number;
  billing_period: IBillingPeriod;
  currency: string;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type SubscriptionModel = Model<ISubscription, Record<string, unknown>>;
