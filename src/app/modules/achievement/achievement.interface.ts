import { Model, Types } from 'mongoose';

export type IAchievementItem = {
  id: string;
  title: string;
  description: string;
  progress: number;
  target?: number;
  progress_percentage?: number;
  is_unlocked: boolean;
  unlocked_at?: string | Date;
};

export type IUserAchievement = {
  _id?: Types.ObjectId | string;
  user: Types.ObjectId | string;
  achievement_key: string;
  progress: number;
  is_unlocked: boolean;
  unlocked_at?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type UserAchievementModel = Model<
  IUserAchievement,
  Record<string, unknown>
>;
