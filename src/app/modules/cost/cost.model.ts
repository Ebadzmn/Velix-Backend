import { Schema, model } from 'mongoose';
import { CostModel, ICost } from './cost.interface';

const costSchema = new Schema<ICost, CostModel>(
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
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount must be a positive number'],
    },
    currency: {
      type: String,
      required: true,
      default: 'SEK',
      trim: true,
    },
    category: {
      type: String,
      required: true,
      default: 'Other',
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
      trim: true,
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

export const Cost = model<ICost, CostModel>('Cost', costSchema);
