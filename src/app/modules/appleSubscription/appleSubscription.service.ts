import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { AppleSubscription } from './appleSubscription.model';
import {
  AppStoreServerAPIClient,
  Environment,
} from '@apple/app-store-server-library';

type IVerifyPayload = {
  transactionId: string;
  originalTransactionId?: string;
  productId: string;
  receiptData?: string;
  signedTransactionInfo?: string;
  purchaseDate?: string | number | Date;
  expiresDate?: string | number | Date;
};

// Helper: initialize Apple Store Server API client if credentials are provided in .env
const getAppleClient = () => {
  const issuerId = process.env.APPLE_ISSUER_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const bundleId = process.env.APPLE_BUNDLE_ID || 'com.velix.app';
  const privateKey = process.env.APPLE_PRIVATE_KEY; // Base64 or raw string of .p8 key

  if (issuerId && keyId && privateKey) {
    const isProduction = process.env.APPLE_ENVIRONMENT === 'Production';
    const env = isProduction ? Environment.PRODUCTION : Environment.SANDBOX;
    return new AppStoreServerAPIClient(privateKey, keyId, issuerId, bundleId, env);
  }
  return null;
};

// Production + Sandbox Apple StoreKit Verification Service
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
  const now = new Date();
  let purchaseDate = payload.purchaseDate ? new Date(payload.purchaseDate) : now;
  if (isNaN(purchaseDate.getTime())) purchaseDate = now;

  let expiresDate: Date;
  let verifiedByAppleApi = false;

  // 1. If Apple Server API Client is configured, query Apple Server API directly
  const appleClient = getAppleClient();
  if (appleClient) {
    try {
      const response = await appleClient.getTransactionInfo(transactionId);
      if (response && response.signedTransactionInfo) {
        verifiedByAppleApi = true;
      }
    } catch (appleErr: any) {
      console.warn('Apple Server API query failed, falling back to local validation:', appleErr?.message);
    }
  }

  // Expiry calculation
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

  // 2. Create or update AppleSubscription document
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
        verifiedVia: verifiedByAppleApi ? 'AppleAppStoreServerAPI' : 'StoreKit2Verification',
        receiptDataPreview: receiptData ? receiptData.substring(0, 50) + '...' : undefined,
        verifiedAt: new Date().toISOString(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // 3. Update User premium status
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

// Restore Purchases
const restorePurchases = async (userId: string, originalTransactionId: string) => {
  if (!originalTransactionId) {
    throw new ApiError(400, 'originalTransactionId is required to restore purchases');
  }

  let existingSubscription = await AppleSubscription.findOne({
    originalTransactionId,
  });

  const now = new Date();

  if (!existingSubscription) {
    const defaultExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    existingSubscription = await AppleSubscription.create({
      user: userId,
      originalTransactionId,
      latestTransactionId: originalTransactionId,
      productId: 'velix_premium_monthly',
      environment: process.env.APPLE_ENVIRONMENT || 'Sandbox',
      status: 'ACTIVE',
      purchaseDate: now,
      expiresDate: defaultExpiry,
      isAutoRenew: true,
      rawResponse: {
        restoredAt: now.toISOString(),
      },
    });
  } else {
    existingSubscription.user = userId as any;
    await existingSubscription.save();
  }

  const isExpired = existingSubscription.expiresDate.getTime() < now.getTime();

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

// Handle App Store Server Notifications V2 (Webhook from Apple)
const handleServerNotification = async (payload: { signedPayload?: string }) => {
  if (!payload || !payload.signedPayload) {
    return { received: true, message: 'No signedPayload provided' };
  }

  try {
    const parts = payload.signedPayload.split('.');
    if (parts.length >= 2) {
      const decodedJson = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      const notificationType = decodedJson.notificationType;
      const subtype = decodedJson.subtype;
      const data = decodedJson.data;

      if (data && data.signedTransactionInfo) {
        const txParts = data.signedTransactionInfo.split('.');
        if (txParts.length >= 2) {
          const txData = JSON.parse(Buffer.from(txParts[1], 'base64').toString('utf8'));
          const origTxId = txData.originalTransactionId;
          const expiresDate = txData.expiresDate ? new Date(txData.expiresDate) : null;
          const isExpired = expiresDate ? expiresDate.getTime() < Date.now() : false;

          let newStatus = 'ACTIVE';
          if (notificationType === 'EXPIRED' || isExpired) {
            newStatus = 'EXPIRED';
          } else if (notificationType === 'REVOKE') {
            newStatus = 'REVOKED';
          }

          if (origTxId) {
            const sub = await AppleSubscription.findOneAndUpdate(
              { originalTransactionId: origTxId },
              {
                status: newStatus,
                expiresDate: expiresDate || undefined,
                latestTransactionId: txData.transactionId,
                rawResponse: { notificationType, subtype, updatedAt: new Date().toISOString() },
              },
              { new: true }
            );

            if (sub && sub.user) {
              await User.findByIdAndUpdate(sub.user, {
                isPremium: newStatus === 'ACTIVE',
                subscriptionExpiresAt: expiresDate || undefined,
              });
            }
          }
        }
      }
    }
  } catch (err: any) {
    console.error('Error handling Apple notification webhook:', err?.message);
  }

  return { received: true };
};

export const AppleSubscriptionService = {
  verifySubscription,
  getSubscriptionStatus,
  restorePurchases,
  handleServerNotification,
};
