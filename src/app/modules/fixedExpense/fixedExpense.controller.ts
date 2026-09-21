import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { FixedExpenseService } from './fixedExpense.service';

const createFixedExpense = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await FixedExpenseService.createFixedExpense(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Fixed expense added successfully',
    data: result,
  });
});

const getAllFixedExpenses = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await FixedExpenseService.getAllFixedExpenses(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Fixed expenses retrieved successfully',
    data: result,
  });
});

const getFixedExpenseById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  const result = await FixedExpenseService.getFixedExpenseById(userId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Fixed expense details fetched successfully',
    data: result,
  });
});

const updateFixedExpense = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  const result = await FixedExpenseService.updateFixedExpense(userId, id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Fixed expense updated successfully',
    data: result,
  });
});

const deleteFixedExpense = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  await FixedExpenseService.deleteFixedExpense(userId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Fixed expense deleted successfully',
  });
});

export const FixedExpenseController = {
  createFixedExpense,
  getAllFixedExpenses,
  getFixedExpenseById,
  updateFixedExpense,
  deleteFixedExpense,
};
