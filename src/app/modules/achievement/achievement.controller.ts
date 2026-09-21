import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AchievementService } from './achievement.service';

const getAchievements = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const statusFilter = req.query.status as string;
  const result = await AchievementService.getAchievementsList(userId, statusFilter);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Achievements retrieved successfully',
    data: result,
  });
});

const getFinancialHealth = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { healthScore, streakDays, userTitle } =
    await AchievementService.calculateHealthAndAchievements(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Financial health score retrieved successfully',
    data: {
      financial_health_score: healthScore,
      current_streak_days: streakDays,
      user_title: userTitle,
    },
  });
});

export const AchievementController = {
  getAchievements,
  getFinancialHealth,
};
