import { Schema, model } from 'mongoose';
import { CostCategoryModel, ICostCategory } from './costCategory.interface';

const costCategorySchema = new Schema<ICostCategory, CostCategoryModel>(
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

export const CostCategory = model<ICostCategory, CostCategoryModel>(
  'CostCategory',
  costCategorySchema
);
