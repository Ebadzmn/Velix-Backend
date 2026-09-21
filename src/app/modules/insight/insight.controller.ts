import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { InsightService } from './insight.service';

const getInsights = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const targetMonth = req.query.month as string;
  const result = await InsightService.getInsights(userId, targetMonth);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Financial insights fetched successfully',
    data: result,
  });
});

export const InsightController = {
  getInsights,
};
