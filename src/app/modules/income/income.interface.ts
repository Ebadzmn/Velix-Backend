import { Model, Types } from 'mongoose';

export type IIncome = {
  _id?: Types.ObjectId | string;
  user: Types.ObjectId | string;
  title: string;
  amount: number;
  date: Date | string;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type IncomeModel = Model<IIncome, Record<string, unknown>>;
