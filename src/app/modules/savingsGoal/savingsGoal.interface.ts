import { Model, Types } from 'mongoose';

export type ISavingsGoal = {
  _id?: Types.ObjectId | string;
  user: Types.ObjectId | string;
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date?: string | Date;
  currency?: string;
  is_active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type SavingsGoalModel = Model<ISavingsGoal, Record<string, unknown>>;
