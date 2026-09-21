import ApiError from '../../../errors/ApiError';
import { FinancialProfile } from '../financialProfile/financialProfile.model';
import { User } from '../user/user.model';
import { ISavingsGoal } from './savingsGoal.interface';
import { SavingsGoal } from './savingsGoal.model';

const createSavingsGoal = async (
  userId: string,
  payload: Partial<ISavingsGoal>
): Promise<ISavingsGoal> => {
  const result = await SavingsGoal.create({
    ...payload,
    user: userId,
    target_date: payload.target_date ? new Date(payload.target_date) : undefined,
  });
  return result;
};

const getAllSavingsGoals = async (
  userId: string
): Promise<{ items: ISavingsGoal[]; total: number }> => {
  let items = await SavingsGoal.find({ user: userId }).sort({ createdAt: -1 });

  // If user has no entries in SavingsGoal collection but has onboarding savingsGoal, auto-create it
  if (items.length === 0) {
    const finProfile = await FinancialProfile.findOne({ user: userId });
    if (finProfile && finProfile.savingsGoal) {
      const user = await User.findById(userId);
      const targetAmount = (finProfile.monthlySavings || 1000) * 10;
      const initialGoal = await SavingsGoal.create({
        user: userId,
        name: finProfile.savingsGoal,
        target_amount: targetAmount,
        saved_amount: 0,
        currency: user?.currency || 'SEK',
        is_active: true,
      });
      items = [initialGoal];
    }
  }

  // Auto-heal any goals with target_amount <= 0
  for (const item of items) {
    if (!item.target_amount || item.target_amount <= 0) {
      const finProfile = await FinancialProfile.findOne({ user: userId });
      const targetAmount = (finProfile?.monthlySavings || 1000) * 10;
      item.target_amount = targetAmount;
      await SavingsGoal.findByIdAndUpdate(item._id, { target_amount: targetAmount });
    }
  }

  const total = items.length;
  return { items, total };
};

const getSavingsGoalById = async (
  userId: string,
  id: string
): Promise<ISavingsGoal | null> => {
  const result = await SavingsGoal.findOne({ _id: id, user: userId });
  if (!result) {
    throw new ApiError(404, 'Savings goal not found');
  }
  return result;
};

const updateSavingsGoal = async (
  userId: string,
  id: string,
  payload: Partial<ISavingsGoal>
): Promise<ISavingsGoal | null> => {
  const updateData: Record<string, unknown> = { ...payload };
  if (payload.target_date) {
    updateData.target_date = new Date(payload.target_date);
  }

  const result = await SavingsGoal.findOneAndUpdate(
    { _id: id, user: userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!result) {
    throw new ApiError(404, 'Savings goal not found');
  }
  return result;
};

const deleteSavingsGoal = async (
  userId: string,
  id: string
): Promise<ISavingsGoal | null> => {
  const result = await SavingsGoal.findOneAndDelete({ _id: id, user: userId });
  if (!result) {
    throw new ApiError(404, 'Savings goal not found');
  }
  return result;
};

export const SavingsGoalService = {
  createSavingsGoal,
  getAllSavingsGoals,
  getSavingsGoalById,
  updateSavingsGoal,
  deleteSavingsGoal,
};
