import { Schema, model } from 'mongoose';
import { ISavingsGoal, SavingsGoalModel } from './savingsGoal.interface';

const savingsGoalSchema = new Schema<ISavingsGoal, SavingsGoalModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    target_amount: {
      type: Number,
      required: true,
    },
    saved_amount: {
      type: Number,
      default: 0,
    },
    target_date: {
      type: Date,
    },
    currency: {
      type: String,
      default: 'SEK',
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret: Record<string, unknown>) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const SavingsGoal = model<ISavingsGoal, SavingsGoalModel>(
  'SavingsGoal',
  savingsGoalSchema
);
