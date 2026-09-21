import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ProfileService } from './profile.service';

const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await ProfileService.getDashboard(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile dashboard fetched successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await ProfileService.getMyProfile(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile fetched successfully',
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await ProfileService.updateProfile(userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

export const ProfileController = {
  getDashboard,
  getMyProfile,
  updateProfile,
};
