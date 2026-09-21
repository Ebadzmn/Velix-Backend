import ApiError from '../../../errors/ApiError';
import { ICost } from './cost.interface';
import { Cost } from './cost.model';

type ICostPayload = {
  title?: string;
  name?: string;
  amount: number;
  category?: string;
  category_id?: string;
  date?: string | Date;
  note?: string;
  currency?: string;
};

const getDateRangeForPeriod = (period = 'this_month') => {
  const now = new Date();
  if (period === 'all') {
    return { startDate: null, endDate: null };
  }

  let startDate: Date;
  let endDate: Date = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  if (period === 'last_month') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (period === 'last_3_months') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
  } else {
    // Default: this_month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  }

  return { startDate, endDate };
};

const getDashboard = async (
  userId: string,
  query: Record<string, unknown> = {}
) => {
  const filterPeriod = (query.filter as string) || (query.period as string) || 'this_month';
  const categoryFilter = (query.category as string) || (query.category_id as string);

  const { startDate, endDate } = getDateRangeForPeriod(filterPeriod);

  const filter: Record<string, unknown> = { user: userId };
  if (startDate && endDate) {
    filter.date = { $gte: startDate, $lte: endDate };
  }

  if (categoryFilter) {
    filter.category = categoryFilter;
  }

  const transactions = await Cost.find(filter).sort({ date: -1, createdAt: -1 });

  let totalAmount = 0;
  transactions.forEach((tx) => {
    totalAmount += tx.amount;
  });

  const currency = transactions.length > 0 && transactions[0].currency ? transactions[0].currency : 'SEK';

  return {
    summary: {
      total_amount: Number(totalAmount.toFixed(2)),
      total_transactions: transactions.length,
      currency,
      active_filter: filterPeriod,
    },
    transactions,
  };
};

const getAllCosts = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 50);
  const skip = (page - 1) * limit;

  const filterPeriod = (query.filter as string) || (query.period as string);
  const categoryFilter = (query.category as string) || (query.category_id as string);

  const filter: Record<string, unknown> = { user: userId };

  if (filterPeriod) {
    const { startDate, endDate } = getDateRangeForPeriod(filterPeriod);
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }
  }

  if (categoryFilter) {
    filter.category = categoryFilter;
  }

  const items = await Cost.find(filter)
    .sort({ date: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Cost.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  return {
    items,
    pagination: {
      current_page: page,
      per_page: limit,
      total,
      total_pages: totalPages,
    },
  };
};

const createCost = async (
  userId: string,
  payload: ICostPayload
): Promise<ICost> => {
  const title = payload.title || payload.name || 'Expense';
  const category = payload.category || payload.category_id || 'Other';
  const date = payload.date ? new Date(payload.date) : new Date();

  const newCost = await Cost.create({
    user: userId,
    title,
    amount: payload.amount,
    category,
    date,
    note: payload.note || '',
    currency: payload.currency || 'SEK',
  });

  const result = await Cost.findById(newCost._id);
  if (!result) {
    throw new ApiError(400, 'Failed to create cost record');
  }

  return result;
};

const getCostById = async (
  userId: string,
  id: string
): Promise<ICost | null> => {
  const result = await Cost.findOne({ _id: id, user: userId });
  if (!result) {
    throw new ApiError(404, 'Variable cost not found');
  }

  return result;
};

const updateCost = async (
  userId: string,
  id: string,
  payload: Partial<ICostPayload>
): Promise<ICost | null> => {
  const updateData: Record<string, unknown> = {};

  if (payload.title || payload.name) {
    updateData.title = payload.title || payload.name;
  }
  if (typeof payload.amount === 'number') {
    updateData.amount = payload.amount;
  }
  if (payload.category || payload.category_id) {
    updateData.category = payload.category || payload.category_id;
  }
  if (payload.date) {
    updateData.date = new Date(payload.date);
  }
  if (typeof payload.note === 'string') {
    updateData.note = payload.note;
  }
  if (payload.currency) {
    updateData.currency = payload.currency;
  }

  const result = await Cost.findOneAndUpdate(
    { _id: id, user: userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!result) {
    throw new ApiError(404, 'Variable cost not found');
  }

  return result;
};

const deleteCost = async (
  userId: string,
  id: string
): Promise<ICost | null> => {
  const result = await Cost.findOneAndDelete({ _id: id, user: userId });
  if (!result) {
    throw new ApiError(404, 'Variable cost not found');
  }
  return result;
};

export const CostService = {
  getDashboard,
  getAllCosts,
  createCost,
  getCostById,
  updateCost,
  deleteCost,
};
