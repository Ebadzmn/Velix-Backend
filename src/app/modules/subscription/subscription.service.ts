import ApiError from '../../../errors/ApiError';
import { getFallbackSubscriptionInfo } from '../../../helpers/subscriptionDefaults';
import { ISubscription } from './subscription.interface';
import { Subscription } from './subscription.model';

type ISubscriptionPayload = {
  name: string;
  price: number;
  billing_period: 'monthly' | 'yearly';
  currency: string;
  category?: string;
  category_id?: string;
};

const getDashboard = async (userId: string) => {
  const subscriptions = await Subscription.find({ user: userId }).sort({
    createdAt: -1,
  });

  let totalPerMonth = 0;
  let totalPerYear = 0;

  for (const sub of subscriptions) {
    // Auto-heal any 0-priced subscriptions
    if (!sub.price || sub.price <= 0) {
      const fallback = getFallbackSubscriptionInfo(sub.name);
      sub.price = fallback.price;
      if (!sub.category || sub.category === 'General') {
        sub.category = fallback.category;
      }
      await Subscription.findByIdAndUpdate(sub._id, {
        price: sub.price,
        category: sub.category,
      });
    }

    if (sub.billing_period === 'monthly') {
      totalPerMonth += sub.price;
      totalPerYear += sub.price * 12;
    } else if (sub.billing_period === 'yearly') {
      totalPerMonth += sub.price / 12;
      totalPerYear += sub.price;
    }
  }

  const currency = subscriptions.length > 0 ? subscriptions[0].currency : 'SEK';

  return {
    summary: {
      total_subscriptions: subscriptions.length,
      total_per_month: Number(totalPerMonth.toFixed(2)),
      total_per_year: Number(totalPerYear.toFixed(2)),
      currency,
    },
    subscriptions,
  };
};

const getAllSubscriptions = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { user: userId };
  if (query.category) {
    filter.category = query.category;
  } else if (query.category_id) {
    filter.category = query.category_id;
  }

  const items = await Subscription.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Auto-heal any 0-priced subscriptions in response list
  for (const sub of items) {
    if (!sub.price || sub.price <= 0) {
      const fallback = getFallbackSubscriptionInfo(sub.name);
      sub.price = fallback.price;
      if (!sub.category || sub.category === 'General') {
        sub.category = fallback.category;
      }
      await Subscription.findByIdAndUpdate(sub._id, {
        price: sub.price,
        category: sub.category,
      });
    }
  }

  const total = await Subscription.countDocuments(filter);
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

const createSubscription = async (
  userId: string,
  payload: ISubscriptionPayload
): Promise<ISubscription> => {
  const { category, category_id, name, price, billing_period, currency, ...rest } = payload;
  const fallback = getFallbackSubscriptionInfo(name);

  const finalPrice = typeof price === 'number' && price > 0 ? price : fallback.price;
  const finalCategory = category || category_id || fallback.category || 'General';
  const finalBillingPeriod = billing_period || fallback.billing_period || 'monthly';
  const finalCurrency = currency || 'SEK';

  const newSub = await Subscription.create({
    ...rest,
    name,
    price: finalPrice,
    billing_period: finalBillingPeriod,
    currency: finalCurrency,
    category: finalCategory,
    user: userId,
  });

  const result = await Subscription.findById(newSub._id);
  if (!result) {
    throw new ApiError(400, 'Failed to create subscription');
  }
  return result;
};

const getSubscriptionById = async (
  userId: string,
  id: string
): Promise<ISubscription | null> => {
  const result = await Subscription.findOne({ _id: id, user: userId });
  if (!result) {
    throw new ApiError(404, 'Subscription not found');
  }

  // Auto-heal if price is 0
  if (!result.price || result.price <= 0) {
    const fallback = getFallbackSubscriptionInfo(result.name);
    result.price = fallback.price;
    await Subscription.findByIdAndUpdate(result._id, { price: result.price });
  }

  return result;
};

const updateSubscription = async (
  userId: string,
  id: string,
  payload: Partial<ISubscriptionPayload>
): Promise<ISubscription | null> => {
  const { category, category_id, ...rest } = payload;
  const updateData: Record<string, unknown> = { ...rest };
  if (category || category_id) {
    updateData.category = category || category_id;
  }

  const result = await Subscription.findOneAndUpdate(
    { _id: id, user: userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!result) {
    throw new ApiError(404, 'Subscription not found');
  }
  return result;
};

const deleteSubscription = async (
  userId: string,
  id: string
): Promise<ISubscription | null> => {
  const result = await Subscription.findOneAndDelete({ _id: id, user: userId });
  if (!result) {
    throw new ApiError(404, 'Subscription not found');
  }
  return result;
};

export const SubscriptionService = {
  getDashboard,
  getAllSubscriptions,
  createSubscription,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
};
