import { Model, Types } from 'mongoose';

export type ICostPeriod = 'this_month' | 'last_month' | 'last_3_months' | 'all';

export type ICost = {
  _id?: Types.ObjectId | string;
  user: Types.ObjectId | string;
  title: string;
  amount: number;
  category: string;
  date: Date | string;
  note?: string;
  currency?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CostModel = Model<ICost, Record<string, unknown>>;
