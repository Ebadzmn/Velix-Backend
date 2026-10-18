import { cert, getApps, initializeApp, App } from 'firebase-admin/app';
import { getMessaging, Message, MulticastMessage, Messaging } from 'firebase-admin/messaging';
import fs from 'fs';
import path from 'path';
import config from './index';
import { errorLogger, logger } from '../shared/logger';
import { DeviceToken } from '../app/modules/notification/notification.model';

export interface IPushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

let firebaseApp: App | null = null;

const resolveServiceAccountPath = (): string | null => {
  const configuredPath = config.firebase.service_account_path;
  if (!configuredPath) return null;

  const candidates = [
    path.isAbsolute(configuredPath) ? configuredPath : path.resolve(process.cwd(), configuredPath),
    path.resolve(process.cwd(), 'velix-f3831-firebase-adminsdk-fbsvc-5cff15e870.json'),
    path.resolve(__dirname, '../../velix-f3831-firebase-adminsdk-fbsvc-5cff15e870.json'),
    path.resolve(__dirname, configuredPath),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
};

export const initializeFirebaseAdmin = (): App | null => {
  const apps = getApps();
  if (apps.length > 0) {
    firebaseApp = apps[0];
    return firebaseApp;
  }

  try {
    let serviceAccount: any = null;

    // 1. Priority: Load from Base64 Environment Variable (Best Practice for Production/Cloud)
    if (config.firebase.service_account_base64) {
      try {
        const decodedJson = Buffer.from(config.firebase.service_account_base64, 'base64').toString('utf8');
        serviceAccount = JSON.parse(decodedJson);
        logger.info('🔑 Firebase service account successfully decoded from Base64 environment variable.');
      } catch (err) {
        errorLogger.error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // 2. Fallback: Load from local JSON file
    if (!serviceAccount) {
      const serviceAccountPath = resolveServiceAccountPath();

      if (!serviceAccountPath) {
        logger.warn('⚠️ Firebase Admin SDK: Service account JSON file or Base64 not found. Push notifications will be disabled.');
        return null;
      }

      const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
      serviceAccount = JSON.parse(fileContent);
    }

    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || 'velix-f3831',
    });

    logger.info(`🔥 Firebase Admin SDK initialized successfully with project [${serviceAccount.project_id}]`);
    return firebaseApp;
  } catch (error) {
    errorLogger.error(`❌ Failed to initialize Firebase Admin SDK: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

// Initialize immediately on module load
initializeFirebaseAdmin();

export const getFirebaseMessaging = (): Messaging | null => {
  if (!firebaseApp && getApps().length === 0) {
    const initialized = initializeFirebaseAdmin();
    if (!initialized) return null;
  }
  return getMessaging(firebaseApp || undefined);
};

/**
 * Send push notification to a specific device FCM token
 */
export const sendPushToDevice = async (
  token: string,
  payload: IPushNotificationPayload
): Promise<string | null> => {
  const messaging = getFirebaseMessaging();
  if (!messaging) {
    logger.warn('FCM messaging not initialized. Skipping push.');
    return null;
  }

  try {
    const message: Message = {
      token,
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
      },
      data: payload.data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'velix_default_channel',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await messaging.send(message);
    logger.info(`📲 FCM sent to device [${token.slice(0, 10)}...]: ${response}`);
    return response;
  } catch (error: any) {
    errorLogger.error(`FCM send error for token [${token.slice(0, 10)}...]: ${error?.message || error}`);
    if (
      error?.code === 'messaging/registration-token-not-registered' ||
      error?.code === 'messaging/invalid-registration-token'
    ) {
      await DeviceToken.updateOne({ fcmToken: token }, { isActive: false });
    }
    return null;
  }
};

/**
 * Send push notification to all active devices registered by a user
 */
export const sendPushToUser = async (
  userId: string,
  payload: IPushNotificationPayload
): Promise<{ successCount: number; failureCount: number }> => {
  const messaging = getFirebaseMessaging();
  if (!messaging) {
    return { successCount: 0, failureCount: 0 };
  }

  try {
    const deviceTokens = await DeviceToken.find({
      user: userId,
      isActive: true,
    });

    if (deviceTokens.length === 0) {
      return { successCount: 0, failureCount: 0 };
    }

    const tokens = deviceTokens.map((d) => d.fcmToken);

    const multicastMessage: MulticastMessage = {
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
        imageUrl: payload.imageUrl,
      },
      data: payload.data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'velix_default_channel',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await messaging.sendEachForMulticast(multicastMessage);

    // Clean up dead/unregistered tokens
    if (response.failureCount > 0) {
      const deadTokens: string[] = [];
      response.responses.forEach((resp: any, idx: number) => {
        if (!resp.success) {
          const errCode = resp.error?.code;
          if (
            errCode === 'messaging/registration-token-not-registered' ||
            errCode === 'messaging/invalid-registration-token'
          ) {
            deadTokens.push(tokens[idx]);
          }
        }
      });

      if (deadTokens.length > 0) {
        await DeviceToken.updateMany(
          { fcmToken: { $in: deadTokens } },
          { isActive: false }
        );
      }
    }

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    errorLogger.error(`Error sending push notification to user ${userId}: ${error instanceof Error ? error.message : String(error)}`);
    return { successCount: 0, failureCount: 0 };
  }
};
