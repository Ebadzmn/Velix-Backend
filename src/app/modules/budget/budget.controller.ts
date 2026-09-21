import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { BudgetService } from './budget.service';

const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const targetMonth = req.query.month as string;
  const result = await BudgetService.getDashboard(userId, targetMonth);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Budget dashboard retrieved successfully',
    data: {
      summary: result.summary,
      savings_goal: result.savings_goal,
      breakdown: result.breakdown,
    },
  });
});

export const BudgetController = {
  getDashboard,
};
