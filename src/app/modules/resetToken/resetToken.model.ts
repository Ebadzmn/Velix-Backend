import { Schema, model } from 'mongoose';
import { IResetToken, ResetTokenModel } from './resetToken.interface';

const resetTokenSchema = new Schema<IResetToken, ResetTokenModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '10m' },
    },
  },
  {
    timestamps: true,
  }
);

export const ResetToken = model<IResetToken, ResetTokenModel>('ResetToken', resetTokenSchema);
