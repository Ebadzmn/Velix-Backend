import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { AppleSubscription } from './appleSubscription.model';

type IVerifyPayload = {
  transactionId: string;
  originalTransactionId?: string;
  productId: string;
  receiptData?: string;
  purchaseDate?: string | number | Date;
  expiresDate?: string | number | Date;
};

// Demo / Sandbox Apple StoreKit Verification Service
const verifySubscription = async (userId: string, payload: IVerifyPayload) => {
  const {
    transactionId,
    productId,
    receiptData,
  } = payload;

  if (!transactionId || !productId) {
    throw new ApiError(400, 'transactionId and productId are required');
  }

  const origTxId = payload.originalTransactionId || transactionId;

  // Calculate purchase & expiry date (Default demo duration: 1 month for monthly, 1 year for annual)
  const now = new Date();
  let purchaseDate = payload.purchaseDate ? new Date(payload.purchaseDate) : now;
  if (isNaN(purchaseDate.getTime())) purchaseDate = now;

  let expiresDate: Date;
  if (payload.expiresDate) {
    expiresDate = new Date(payload.expiresDate);
    if (isNaN(expiresDate.getTime())) {
      expiresDate = new Date(purchaseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  } else if (productId.toLowerCase().includes('year') || productId.toLowerCase().includes('annual')) {
    expiresDate = new Date(purchaseDate.getTime() + 365 * 24 * 60 * 60 * 1000);
  } else {
    // Default 30 days monthly
    expiresDate = new Date(purchaseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  const isExpired = expiresDate.getTime() < Date.now();
  const subscriptionStatus = isExpired ? 'EXPIRED' : 'ACTIVE';

  // 1. Create or update AppleSubscription document
  const subscriptionRecord = await AppleSubscription.findOneAndUpdate(
    { originalTransactionId: origTxId },
    {
      user: userId,
      originalTransactionId: origTxId,
      latestTransactionId: transactionId,
      productId,
      environment: process.env.APPLE_ENVIRONMENT || 'Sandbox',
      status: subscriptionStatus,
      purchaseDate,
      expiresDate,
      isAutoRenew: true,
      rawResponse: {
        verifiedVia: 'AppleStoreKit2MockVerifier',
        receiptDataPreview: receiptData ? receiptData.substring(0, 50) + '...' : undefined,
        verifiedAt: new Date().toISOString(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // 2. Update User premium status
  const user = await User.findByIdAndUpdate(
    userId,
    {
      isPremium: !isExpired,
      premiumPlan: productId,
      subscriptionExpiresAt: expiresDate,
    },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return {
    isPremium: !isExpired,
    productId,
    status: subscriptionStatus,
    expiresAt: expiresDate,
    purchaseDate,
    originalTransactionId: origTxId,
    latestTransactionId: transactionId,
    subscription: subscriptionRecord,
  };
};

// Check User Active Subscription Status
const getSubscriptionStatus = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const now = new Date();
  const latestSubscription = await AppleSubscription.findOne({ user: userId }).sort({ expiresDate: -1 });

  let isPremium = false;
  let expiresAt: Date | null = null;
  let plan = user.premiumPlan || 'Free';
  let daysRemaining = 0;

  if (latestSubscription && latestSubscription.expiresDate) {
    expiresAt = latestSubscription.expiresDate;
    if (expiresAt.getTime() > now.getTime() && latestSubscription.status === 'ACTIVE') {
      isPremium = true;
      daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      plan = latestSubscription.productId;
    }
  } else if (user.subscriptionExpiresAt && user.subscriptionExpiresAt.getTime() > now.getTime()) {
    isPremium = true;
    expiresAt = user.subscriptionExpiresAt;
    daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  // Self-heal user isPremium flag if expired
  if (user.isPremium !== isPremium) {
    await User.findByIdAndUpdate(userId, { isPremium });
  }

  return {
    isPremium,
    tier: isPremium ? 'PREMIUM' : 'FREE',
    plan,
    isActive: isPremium,
    isAutoRenew: latestSubscription ? latestSubscription.isAutoRenew : false,
    expiresAt,
    daysRemaining,
    originalTransactionId: latestSubscription?.originalTransactionId || null,
  };
};

// Restore Purchases (Binding existing active Apple purchases to current logged in user)
const restorePurchases = async (userId: string, originalTransactionId: string) => {
  if (!originalTransactionId) {
    throw new ApiError(400, 'originalTransactionId is required to restore purchases');
  }

  // Find existing subscription record with this transaction ID
  let existingSubscription = await AppleSubscription.findOne({
    originalTransactionId,
  });

  const now = new Date();

  // If not found in DB, in sandbox/demo mode we create one with valid 30 days expiry
  if (!existingSubscription) {
    const defaultExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    existingSubscription = await AppleSubscription.create({
      user: userId,
      originalTransactionId,
      latestTransactionId: originalTransactionId,
      productId: 'velix_premium_monthly',
      environment: 'Sandbox',
      status: 'ACTIVE',
      purchaseDate: now,
      expiresDate: defaultExpiry,
      isAutoRenew: true,
      rawResponse: {
        restoredAt: now.toISOString(),
      },
    });
  } else {
    // Re-bind to current user
    existingSubscription.user = userId as any;
    await existingSubscription.save();
  }

  const isExpired = existingSubscription.expiresDate.getTime() < now.getTime();

  // Update user
  await User.findByIdAndUpdate(userId, {
    isPremium: !isExpired,
    premiumPlan: existingSubscription.productId,
    subscriptionExpiresAt: existingSubscription.expiresDate,
  });

  return {
    isRestored: true,
    isPremium: !isExpired,
    plan: existingSubscription.productId,
    expiresAt: existingSubscription.expiresDate,
    status: isExpired ? 'EXPIRED' : 'ACTIVE',
    originalTransactionId,
  };
};

export const AppleSubscriptionService = {
  verifySubscription,
  getSubscriptionStatus,
  restorePurchases,
};
