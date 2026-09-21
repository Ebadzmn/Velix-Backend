import ApiError from '../../../errors/ApiError';
import { IIncome } from './income.interface';
import { Income } from './income.model';

const createIncome = async (
  userId: string,
  payload: Partial<IIncome>
): Promise<IIncome> => {
  const result = await Income.create({
    ...payload,
    user: userId,
    date: payload.date ? new Date(payload.date) : new Date(),
  });
  return result;
};

const getAllIncomes = async (
  userId: string,
  query: Record<string, unknown>
): Promise<{ items: IIncome[]; total: number }> => {
  const filter: Record<string, unknown> = { user: userId };

  if (query.month) {
    const monthStr = query.month as string; // YYYY-MM
    const [year, month] = monthStr.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    filter.date = { $gte: startDate, $lte: endDate };
  }

  const items = await Income.find(filter).sort({ date: -1, createdAt: -1 });
  const total = await Income.countDocuments(filter);

  return { items, total };
};

const getIncomeById = async (userId: string, id: string): Promise<IIncome | null> => {
  const result = await Income.findOne({ _id: id, user: userId });
  if (!result) {
    throw new ApiError(404, 'Income record not found');
  }
  return result;
};

const updateIncome = async (
  userId: string,
  id: string,
  payload: Partial<IIncome>
): Promise<IIncome | null> => {
  const updateData: Record<string, unknown> = { ...payload };
  if (payload.date) {
    updateData.date = new Date(payload.date);
  }

  const result = await Income.findOneAndUpdate(
    { _id: id, user: userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!result) {
    throw new ApiError(404, 'Income record not found');
  }
  return result;
};

const deleteIncome = async (userId: string, id: string): Promise<IIncome | null> => {
  const result = await Income.findOneAndDelete({ _id: id, user: userId });
  if (!result) {
    throw new ApiError(404, 'Income record not found');
  }
  return result;
};

export const IncomeService = {
  createIncome,
  getAllIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
};
