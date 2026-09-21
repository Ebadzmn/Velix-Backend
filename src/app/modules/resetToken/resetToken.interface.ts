import { Model, Types } from 'mongoose';

export type IResetToken = {
  user?: Types.ObjectId;
  email: string;
  otp: string;
  expiresAt: Date;
};

export type ResetTokenModel = Model<IResetToken, Record<string, unknown>>;
