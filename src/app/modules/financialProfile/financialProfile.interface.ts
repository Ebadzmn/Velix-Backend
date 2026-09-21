import { Model, Types } from 'mongoose';

export type IFixedCost = {
  category: string;
  amount: number;
};

export type ISubscriptionInput = {
  name: string;
  price?: number;
  billing_period?: 'monthly' | 'yearly';
  category?: string;
  currency?: string;
};

export type IFinancialProfile = {
  _id?: Types.ObjectId | string;
  user: Types.ObjectId | string;
  monthlySalary: number;
  otherIncome?: number;
  subscriptions?: (string | ISubscriptionInput)[];
  fixedCosts?: IFixedCost[];
  monthlySavings: number;
  savingsGoal: string;
};

export type FinancialProfileModel = Model<IFinancialProfile, Record<string, unknown>>;
