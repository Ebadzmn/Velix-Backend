import ApiError from '../../../errors/ApiError';
import { SubscriptionCategory } from '../subscriptionCategory/subscriptionCategory.model';
import { IPopularService } from './popularService.interface';
import { PopularService } from './popularService.model';

type IPopularServicePayload = {
  name: string;
  price: number;
  billing_period: 'monthly' | 'yearly';
  currency: string;
  category_id: string;
  logo?: string;
  description?: string;
};

const createPopularService = async (
  payload: IPopularServicePayload
): Promise<IPopularService> => {
  const { category_id, ...rest } = payload;

  const categoryExists = await SubscriptionCategory.findById(category_id);
  if (!categoryExists) {
    throw new ApiError(404, 'Category not found');
  }

  const result = await PopularService.create({
    ...rest,
    category: category_id,
  });

  const populated = await PopularService.findById(result._id).populate(
    'category',
    'id name'
  );
  if (!populated) {
    throw new ApiError(400, 'Failed to create popular service');
  }

  return populated;
};

const getAllPopularServices = async (
  query: Record<string, unknown>
): Promise<IPopularService[]> => {
  const filter: Record<string, unknown> = {};
  if (query.category_id) {
    filter.category = query.category_id;
  }

  const services = await PopularService.find(filter)
    .populate('category', 'id name')
    .sort({ createdAt: -1 });

  return services;
};

const getPopularServiceById = async (id: string): Promise<IPopularService | null> => {
  const result = await PopularService.findById(id).populate('category', 'id name');
  if (!result) {
    throw new ApiError(404, 'Popular service not found');
  }
  return result;
};

const updatePopularService = async (
  id: string,
  payload: Partial<IPopularServicePayload>
): Promise<IPopularService | null> => {
  const { category_id, ...rest } = payload;
  const updateData: Record<string, unknown> = { ...rest };
  if (category_id) {
    updateData.category = category_id;
  }

  const result = await PopularService.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate('category', 'id name');

  if (!result) {
    throw new ApiError(404, 'Popular service not found');
  }
  return result;
};

const deletePopularService = async (id: string): Promise<IPopularService | null> => {
  const result = await PopularService.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(404, 'Popular service not found');
  }
  return result;
};

export const PopularServiceService = {
  createPopularService,
  getAllPopularServices,
  getPopularServiceById,
  updatePopularService,
  deletePopularService,
};
