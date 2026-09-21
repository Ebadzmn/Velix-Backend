import { Schema, model } from 'mongoose';
import {
  ISubscriptionCategory,
  SubscriptionCategoryModel,
} from './subscriptionCategory.interface';

const subscriptionCategorySchema = new Schema<
  ISubscriptionCategory,
  SubscriptionCategoryModel
>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const SubscriptionCategory = model<
  ISubscriptionCategory,
  SubscriptionCategoryModel
>('SubscriptionCategory', subscriptionCategorySchema);
