import { Model, Types } from 'mongoose';

export type ICostCategory = {
  _id?: Types.ObjectId | string;
  name: string;
};

export type CostCategoryModel = Model<ICostCategory, Record<string, unknown>>;
