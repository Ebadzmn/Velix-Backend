import mongoose from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { getFallbackSubscriptionInfo } from '../../../helpers/subscriptionDefaults';
import { PopularService } from '../popularService/popularService.model';
import { SavingsGoal } from '../savingsGoal/savingsGoal.model';
import { Subscription } from '../subscription/subscription.model';
import { User } from '../user/user.model';
import { IFinancialProfile, ISubscriptionInput } from './financialProfile.interface';
import { FinancialProfile } from './financialProfile.model';

const createOrUpdateProfile = async (
  userId: string,
  payload: IFinancialProfile
): Promise<IFinancialProfile> => {
  const user = await User.findById(userId);
  const defaultCurrency = user?.currency || 'SEK';

  // 1. Process and synchronize subscriptions to Subscription collection
  const subscriptionNames: string[] = [];

  if (payload.subscriptions && Array.isArray(payload.subscriptions)) {
    for (const subItem of payload.subscriptions) {
      let name = '';
      let price: number | undefined;
      let billing_period: 'monthly' | 'yearly' = 'monthly';
      let category = 'Entertainment';
      let currency = defaultCurrency;

      if (typeof subItem === 'string') {
        name = subItem.trim();
      } else if (typeof subItem === 'object' && subItem !== null) {
        const itemObj = subItem as ISubscriptionInput;
        name = itemObj.name?.trim() || '';
        if (typeof itemObj.price === 'number' && itemObj.price > 0) {
          price = itemObj.price;
        }
        if (itemObj.billing_period) billing_period = itemObj.billing_period;
        if (itemObj.category) category = itemObj.category;
        if (itemObj.currency) currency = itemObj.currency;
      }

      if (!name) continue;

      // 1a. Search if this service exists in PopularService
      let popularService = null;
      if (mongoose.Types.ObjectId.isValid(name)) {
        popularService = await PopularService.findById(name).populate(
          'category',
          'name'
        );
      }
      if (!popularService) {
        popularService = await PopularService.findOne({
          name: { $regex: new RegExp(`^${name}$`, 'i') },
        }).populate('category', 'name');
      }

      if (popularService) {
        name = popularService.name;
        if (price === undefined && popularService.price > 0) {
          price = popularService.price;
        }
        if (typeof subItem === 'string' || !(subItem as ISubscriptionInput).billing_period) {
          billing_period = popularService.billing_period;
        }
        if (typeof subItem === 'string' || !(subItem as ISubscriptionInput).category) {
          category = (popularService.category as any)?.name || 'Entertainment';
        }
        if (typeof subItem === 'string' || !(subItem as ISubscriptionInput).currency) {
          currency = popularService.currency || defaultCurrency;
        }
      }

      // 1b. Fallback pricing if price is still undefined or 0
      if (price === undefined || price <= 0) {
        const fallback = getFallbackSubscriptionInfo(name);
        price = fallback.price;
        if (typeof subItem === 'string' || !(subItem as ISubscriptionInput).billing_period) {
          billing_period = fallback.billing_period;
        }
        if (typeof subItem === 'string' || !(subItem as ISubscriptionInput).category) {
          category = fallback.category;
        }
      }

      subscriptionNames.push(name);

      // 1c. Check if user already has this subscription in their Subscription collection
      const existingSub = await Subscription.findOne({
        user: userId,
        name: { $regex: new RegExp(`^${name}$`, 'i') },
      });

      if (existingSub) {
        if (existingSub.price === 0 || price > 0) {
          existingSub.price = price;
          existingSub.billing_period = billing_period;
          existingSub.category = category;
          existingSub.currency = currency;
          await existingSub.save();
        }
      } else {
        await Subscription.create({
          user: userId,
          name,
          price,
          billing_period,
          category,
          currency,
        });
      }
    }
  }

  // 2. Synchronize Savings Goal if provided
  if (payload.savingsGoal) {
    const monthlyTarget = payload.monthlySavings || 1000;
    const defaultTargetAmount = monthlyTarget * 10; // e.g. 10,000 for 1,000 monthly target

    let activeGoal = await SavingsGoal.findOne({
      user: userId,
      is_active: true,
    });

    if (!activeGoal) {
      await SavingsGoal.create({
        user: userId,
        name: payload.savingsGoal,
        target_amount: defaultTargetAmount,
        saved_amount: 0,
        currency: defaultCurrency,
        is_active: true,
      });
    } else {
      activeGoal.name = payload.savingsGoal;
      if (!activeGoal.target_amount || activeGoal.target_amount <= 0) {
        activeGoal.target_amount = defaultTargetAmount;
      }
      await activeGoal.save();
    }
  }

  // 3. Upsert Financial Profile
  const profileData = {
    ...payload,
    subscriptions: subscriptionNames.length > 0 ? subscriptionNames : payload.subscriptions,
    user: userId,
  };

  const result = await FinancialProfile.findOneAndUpdate(
    { user: userId },
    profileData,
    { upsert: true, new: true, runValidators: true }
  ).populate(
    'user',
    'firstName lastName email phoneNumber country currency role status isFinancialProfileCompleted'
  );

  // 4. Mark financial profile as completed for this user
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
