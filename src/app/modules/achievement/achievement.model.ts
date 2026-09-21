import { Schema, model } from 'mongoose';
import {
  IUserAchievement,
  UserAchievementModel,
} from './achievement.interface';

const userAchievementSchema = new Schema<
  IUserAchievement,
  UserAchievementModel
>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    achievement_key: {
      type: String,
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    is_unlocked: {
      type: Boolean,
      default: false,
    },
    unlocked_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

userAchievementSchema.index({ user: 1, achievement_key: 1 }, { unique: true });

export const UserAchievement = model<IUserAchievement, UserAchievementModel>(
  'UserAchievement',
  userAchievementSchema
);
