import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AppleSubscriptionService } from './appleSubscription.service';

const verifySubscription = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await AppleSubscriptionService.verifySubscription(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Apple subscription verified successfully',
    data: result,
  });
});

const getSubscriptionStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await AppleSubscriptionService.getSubscriptionStatus(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subscription status fetched successfully',
    data: result,
  });
});

const restorePurchases = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { originalTransactionId } = req.body;
  const result = await AppleSubscriptionService.restorePurchases(userId, originalTransactionId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Purchases restored successfully',
    data: result,
  });
});

// App Store Server Notifications V2 Webhook handler
const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const result = await AppleSubscriptionService.handleServerNotification(req.body);

  // Apple expects immediate 200 OK
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const AppleSubscriptionController = {
  verifySubscription,
  getSubscriptionStatus,
  restorePurchases,
  handleWebhook,
};
