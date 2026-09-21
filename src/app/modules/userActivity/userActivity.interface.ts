import { Model, Types } from 'mongoose';

export type IUserActivity = {
  _id?: Types.ObjectId | string;
  user: Types.ObjectId | string;
  activity_date: string; // Format YYYY-MM-DD
  activity_type?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UserActivityModel = Model<IUserActivity, Record<string, unknown>>;
