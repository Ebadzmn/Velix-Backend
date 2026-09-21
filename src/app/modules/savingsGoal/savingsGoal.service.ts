import ApiError from '../../../errors/ApiError';
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
  const items = await SavingsGoal.find({ user: userId }).sort({ createdAt: -1 });
  const total = await SavingsGoal.countDocuments({ user: userId });
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
