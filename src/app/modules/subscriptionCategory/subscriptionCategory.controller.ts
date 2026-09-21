import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SubscriptionCategoryService } from './subscriptionCategory.service';

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionCategoryService.getAllCategories();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subscription categories retrieved successfully',
    data: result,
  });
});

export const SubscriptionCategoryController = {
  getAllCategories,
};
