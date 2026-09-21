import ApiError from '../../../errors/ApiError';
import { IFixedExpense } from './fixedExpense.interface';
import { FixedExpense } from './fixedExpense.model';

const createFixedExpense = async (
  userId: string,
  payload: Partial<IFixedExpense>
): Promise<IFixedExpense> => {
  const result = await FixedExpense.create({
    ...payload,
    user: userId,
  });
  return result;
};

const getAllFixedExpenses = async (
  userId: string
): Promise<{ items: IFixedExpense[]; total: number }> => {
  const items = await FixedExpense.find({ user: userId }).sort({ createdAt: -1 });
  const total = await FixedExpense.countDocuments({ user: userId });
  return { items, total };
};

const getFixedExpenseById = async (
  userId: string,
  id: string
): Promise<IFixedExpense | null> => {
  const result = await FixedExpense.findOne({ _id: id, user: userId });
  if (!result) {
    throw new ApiError(404, 'Fixed expense record not found');
  }
  return result;
};

const updateFixedExpense = async (
  userId: string,
  id: string,
  payload: Partial<IFixedExpense>
): Promise<IFixedExpense | null> => {
  const result = await FixedExpense.findOneAndUpdate(
    { _id: id, user: userId },
    payload,
    { new: true, runValidators: true }
  );

  if (!result) {
    throw new ApiError(404, 'Fixed expense record not found');
  }
  return result;
};

const deleteFixedExpense = async (
  userId: string,
  id: string
): Promise<IFixedExpense | null> => {
  const result = await FixedExpense.findOneAndDelete({ _id: id, user: userId });
  if (!result) {
    throw new ApiError(404, 'Fixed expense record not found');
  }
  return result;
};

export const FixedExpenseService = {
  createFixedExpense,
  getAllFixedExpenses,
  getFixedExpenseById,
  updateFixedExpense,
  deleteFixedExpense,
};
