import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SavingsGoalService } from './savingsGoal.service';

const createSavingsGoal = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await SavingsGoalService.createSavingsGoal(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Savings goal created successfully',
    data: result,
  });
});

const getAllSavingsGoals = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await SavingsGoalService.getAllSavingsGoals(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Savings goals retrieved successfully',
    data: result,
  });
});

const getSavingsGoalById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  const result = await SavingsGoalService.getSavingsGoalById(userId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Savings goal details fetched successfully',
    data: result,
  });
});

const updateSavingsGoal = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  const result = await SavingsGoalService.updateSavingsGoal(userId, id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Savings goal updated successfully',
    data: result,
  });
});

const deleteSavingsGoal = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  await SavingsGoalService.deleteSavingsGoal(userId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Savings goal deleted successfully',
  });
});

export const SavingsGoalController = {
  createSavingsGoal,
  getAllSavingsGoals,
  getSavingsGoalById,
  updateSavingsGoal,
  deleteSavingsGoal,
};
