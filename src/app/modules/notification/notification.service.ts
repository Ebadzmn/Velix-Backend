import ApiError from '../../../errors/ApiError';
import {
  IDeviceToken,
  INotification,
  INotificationPreference,
} from './notification.interface';
import {
  DeviceToken,
  Notification,
  NotificationPreference,
} from './notification.model';

// 1. Get User Notification Preferences (creates default if not exist)
const getNotificationPreferences = async (
  userId: string
): Promise<INotificationPreference> => {
  let preferences = await NotificationPreference.findOne({ user: userId });
  if (!preferences) {
    preferences = await NotificationPreference.create({ user: userId });
  }
  return preferences;
};

// 2. Update User Notification Preferences
const updateNotificationPreferences = async (
  userId: string,
  payload: Partial<INotificationPreference>
): Promise<INotificationPreference> => {
  const preferences = await NotificationPreference.findOneAndUpdate(
    { user: userId },
    { ...payload, user: userId },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );
  return preferences;
};

// 3. Register or Update FCM Device Token
const registerDeviceToken = async (
  userId: string,
  payload: { fcmToken: string; deviceType: 'android' | 'ios' | 'web' }
): Promise<IDeviceToken> => {
  const token = await DeviceToken.findOneAndUpdate(
    { fcmToken: payload.fcmToken },
    {
      user: userId,
      fcmToken: payload.fcmToken,
      deviceType: payload.deviceType,
      isActive: true,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );
  return token;
};

// 4. Get User In-App Notifications Feed
const getAllNotifications = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { user: userId };
  if (query.isRead !== undefined) {
    filter.isRead = query.isRead === 'true' || query.isRead === true;
  }
  if (query.type) {
    filter.type = query.type;
  }

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      total_pages: totalPages,
      unreadCount,
    },
    data: items,
  };
};

// 5. Mark Single Notification as Read
const markAsRead = async (
  userId: string,
  notificationId: string
): Promise<INotification | null> => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  return notification;
};

// 6. Mark All Notifications as Read
const markAllAsRead = async (userId: string) => {
  const result = await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );
  return { modifiedCount: result.modifiedCount };
};

// 7. Delete Notification
const deleteNotification = async (userId: string, notificationId: string) => {
  const result = await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId,
  });

  if (!result) {
    throw new ApiError(404, 'Notification not found');
  }

  return result;
};

export const NotificationService = {
  getNotificationPreferences,
  updateNotificationPreferences,
  registerDeviceToken,
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
