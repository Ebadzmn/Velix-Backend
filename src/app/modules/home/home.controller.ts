import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { HomeService } from './home.service';

const getHomeDashboard = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const targetMonth = req.query.month as string;
  const result = await HomeService.getHomeDashboard(userId, targetMonth);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Home page data fetched successfully',
    data: result,
  });
});

export const HomeController = {
  getHomeDashboard,
};
