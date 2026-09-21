import { Model, Types } from 'mongoose';

export type IFixedExpense = {
  _id?: Types.ObjectId | string;
  user: Types.ObjectId | string;
  title: string;
  category?: string;
  amount: number;
  frequency?: 'monthly' | 'yearly';
  createdAt?: Date;
  updatedAt?: Date;
};

export type FixedExpenseModel = Model<IFixedExpense, Record<string, unknown>>;
