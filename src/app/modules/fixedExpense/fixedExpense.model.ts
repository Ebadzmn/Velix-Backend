import { Schema, model } from 'mongoose';
import { FixedExpenseModel, IFixedExpense } from './fixedExpense.interface';

const fixedExpenseSchema = new Schema<IFixedExpense, FixedExpenseModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    amount: {
      type: Number,
      required: true,
    },
    frequency: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
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

export const FixedExpense = model<IFixedExpense, FixedExpenseModel>(
  'FixedExpense',
  fixedExpenseSchema
);
