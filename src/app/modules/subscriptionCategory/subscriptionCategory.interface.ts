import { Model, Types } from 'mongoose';

export type ISubscriptionCategory = {
  _id?: Types.ObjectId | string;
  name: string;
};

export type SubscriptionCategoryModel = Model<
  ISubscriptionCategory,
  Record<string, unknown>
>;
