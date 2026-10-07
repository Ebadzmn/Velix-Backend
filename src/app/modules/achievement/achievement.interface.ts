import { Model, Types } from 'mongoose';

export type IAchievementItem = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'onboarding' | 'savings' | 'subscriptions' | 'health' | 'streak';
  is_unlocked: boolean;
  unlocked_at?: string;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
};

export type IStreakSummary = {
  current_streak_days: number;
  longest_streak_days: number;
  last_activity_date: string;
  streak_title: string;
  streak_message: string;
};

export type IAchievementDashboard = {
  streak: IStreakSummary;
  financial_health: {
    score: number;
    max_score: number;
    percentage: number;
  };
  summary: {
    total_achievements: number;
    unlocked_count: number;
    locked_count: number;
    progress_percentage: number;
  };
  unlocked: IAchievementItem[];
  locked: IAchievementItem[];
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
