import { Schema, model } from 'mongoose';
import { IUserActivity, UserActivityModel } from './userActivity.interface';

const userActivitySchema = new Schema<IUserActivity, UserActivityModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activity_date: {
      type: String,
      required: true,
    },
    activity_type: {
      type: String,
      default: 'app_login',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

userActivitySchema.index({ user: 1, activity_date: 1 }, { unique: true });

export const UserActivity = model<IUserActivity, UserActivityModel>(
  'UserActivity',
  userActivitySchema
);
