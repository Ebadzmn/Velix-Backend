import { Schema, model } from 'mongoose';
import { AppleSubscriptionModel, IAppleSubscription } from './appleSubscription.interface';

const appleSubscriptionSchema = new Schema<IAppleSubscription, AppleSubscriptionModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalTransactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    latestTransactionId: {
      type: String,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    environment: {
      type: String,
      enum: ['Sandbox', 'Production'],
      default: 'Sandbox',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED', 'CANCELLED', 'GRACE_PERIOD'],
      default: 'ACTIVE',
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    expiresDate: {
      type: Date,
      required: true,
      index: true,
    },
    isAutoRenew: {
      type: Boolean,
      default: true,
    },
    rawResponse: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

export const AppleSubscription = model<IAppleSubscription, AppleSubscriptionModel>(
  'AppleSubscription',
  appleSubscriptionSchema
);
