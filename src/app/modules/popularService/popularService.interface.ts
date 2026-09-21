import { Model, Types } from 'mongoose';

export type IBillingPeriod = 'monthly' | 'yearly';

export type IPopularService = {
  _id?: Types.ObjectId | string;
  name: string;
  price: number;
  billing_period: IBillingPeriod;
  currency: string;
  category: Types.ObjectId | string;
  logo?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type PopularServiceModel = Model<IPopularService, Record<string, unknown>>;
