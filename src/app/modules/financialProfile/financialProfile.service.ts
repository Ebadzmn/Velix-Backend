import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { IFinancialProfile } from './financialProfile.interface';
import { FinancialProfile } from './financialProfile.model';

const createOrUpdateProfile = async (
  userId: string,
  payload: IFinancialProfile
): Promise<IFinancialProfile> => {
  const result = await FinancialProfile.findOneAndUpdate(
    { user: userId },
    { ...payload, user: userId },
    { upsert: true, new: true, runValidators: true }
  ).populate('user', 'firstName lastName email phoneNumber country currency role status isFinancialProfileCompleted');

  // Mark financial profile as completed for this user
  await User.findByIdAndUpdate(userId, { isFinancialProfileCompleted: true });

  return result;
};

const getMyProfile = async (userId: string): Promise<IFinancialProfile | null> => {
  const result = await FinancialProfile.findOne({ user: userId }).populate(
    'user',
    'firstName lastName email phoneNumber country currency role status'
  );

  if (!result) {
    throw new ApiError(404, 'Financial profile not found for this user');
  }

  return result;
};

export const FinancialProfileService = {
  createOrUpdateProfile,
  getMyProfile,
};
