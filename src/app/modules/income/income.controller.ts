import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IncomeService } from './income.service';

const createIncome = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await IncomeService.createIncome(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Income added successfully',
    data: result,
  });
});

const getAllIncomes = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await IncomeService.getAllIncomes(userId, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Incomes retrieved successfully',
    data: result,
  });
});

const getIncomeById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  const result = await IncomeService.getIncomeById(userId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Income details fetched successfully',
    data: result,
  });
});

const updateIncome = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  const result = await IncomeService.updateIncome(userId, id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Income updated successfully',
    data: result,
  });
});

const deleteIncome = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  await IncomeService.deleteIncome(userId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Income deleted successfully',
  });
});

export const IncomeController = {
  createIncome,
  getAllIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
};
