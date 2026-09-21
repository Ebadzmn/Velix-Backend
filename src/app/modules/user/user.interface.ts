import { Model, Types } from 'mongoose';
import { ENUM_USER_ROLE } from '../../../enums/user';

export type IUser = {
  _id?: Types.ObjectId | string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  country?: string;
  currency?: string;
  role: ENUM_USER_ROLE;
  status: 'active' | 'blocked';
  isFinancialProfileCompleted?: boolean;
  profileImage?: string;
};

export type UserModel = {
  isUserExist(email: string): Promise<IUser | null>;
  isPasswordMatched(givenPassword: string, savedPassword: string): Promise<boolean>;
} & Model<IUser>;
