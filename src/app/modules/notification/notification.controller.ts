import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { NotificationService } from './notification.service';

const getNotificationPreferences = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const result = await NotificationService.getNotificationPreferences(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Notification preferences retrieved successfully',
      data: result,
    });
  }
);

const updateNotificationPreferences = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const result = await NotificationService.updateNotificationPreferences(
      userId,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Notification preferences updated successfully',
      data: result,
    });
  }
);

const registerDeviceToken = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const result = await NotificationService.registerDeviceToken(
      userId,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Device registered for push notifications successfully',
      data: result,
    });
  }
);

const getAllNotifications = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const result = await NotificationService.getAllNotifications(
      userId,
      req.query
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Notifications retrieved successfully',
      meta: result.meta,
      data: result.data,
    });
  }
);

const markAsRead = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { id } = req.params;
    const result = await NotificationService.markAsRead(userId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Notification marked as read',
      data: result,
    });
  }
);

const markAllAsRead = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const result = await NotificationService.markAllAsRead(userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'All notifications marked as read',
      data: result,
    });
  }
);

const deleteNotification = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { id } = req.params;
    const result = await NotificationService.deleteNotification(userId, id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Notification deleted successfully',
      data: result,
    });
  }
);

export const NotificationController = {
  getNotificationPreferences,
  updateNotificationPreferences,
  registerDeviceToken,
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
