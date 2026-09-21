import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { FinancialProfileService } from './financialProfile.service';

const createOrUpdateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await FinancialProfileService.createOrUpdateProfile(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Financial onboarding profile saved successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await FinancialProfileService.getMyProfile(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Financial profile retrieved successfully',
    data: result,
  });
});

export const FinancialProfileController = {
  createOrUpdateProfile,
  getMyProfile,
};
