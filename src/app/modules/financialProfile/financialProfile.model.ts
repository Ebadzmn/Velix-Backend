import { Schema, model } from 'mongoose';
import { FinancialProfileModel, IFinancialProfile } from './financialProfile.interface';

const fixedCostSchema = new Schema({
  category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

const financialProfileSchema = new Schema<IFinancialProfile, FinancialProfileModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    monthlySalary: {
      type: Number,
      required: true,
    },
    otherIncome: {
      type: Number,
      default: 0,
    },
    subscriptions: {
      type: [String],
      default: [],
    },
    fixedCosts: {
      type: [fixedCostSchema],
      default: [],
    },
    monthlySavings: {
      type: Number,
      required: true,
    },
    savingsGoal: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const FinancialProfile = model<IFinancialProfile, FinancialProfileModel>(
  'FinancialProfile',
  financialProfileSchema
);
