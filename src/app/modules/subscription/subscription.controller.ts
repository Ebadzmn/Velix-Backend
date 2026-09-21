import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SubscriptionService } from './subscription.service';

const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await SubscriptionService.getDashboard(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subscription dashboard fetched successfully',
    data: result,
  });
});

const getAllSubscriptions = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await SubscriptionService.getAllSubscriptions(userId, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subscriptions retrieved successfully',
    data: result,
  });
});

const createSubscription = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await SubscriptionService.createSubscription(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Subscription added successfully',
    data: result,
  });
});

const getSubscriptionById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  const result = await SubscriptionService.getSubscriptionById(userId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subscription fetched successfully',
    data: result,
  });
});

const updateSubscription = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  const result = await SubscriptionService.updateSubscription(userId, id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subscription updated successfully',
    data: result,
  });
});

const deleteSubscription = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  await SubscriptionService.deleteSubscription(userId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subscription deleted successfully',
  });
});

export const SubscriptionController = {
  getDashboard,
  getAllSubscriptions,
  createSubscription,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
};
