import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CostService } from './cost.service';

const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await CostService.getDashboard(userId, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Variable costs dashboard fetched successfully',
    data: result,
  });
});

const getAllCosts = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await CostService.getAllCosts(userId, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Variable costs retrieved successfully',
    data: result,
  });
});

const createCost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const result = await CostService.createCost(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Variable cost added successfully',
    data: result,
  });
});

const getCostById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  const result = await CostService.getCostById(userId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Variable cost retrieved successfully',
    data: result,
  });
});

const updateCost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  const result = await CostService.updateCost(userId, id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Variable cost updated successfully',
    data: result,
  });
});

const deleteCost = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const id = req.params.id as string;
  await CostService.deleteCost(userId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Variable cost deleted successfully',
    data: null,
  });
});

export const CostController = {
  getDashboard,
  getAllCosts,
  createCost,
  getCostById,
  updateCost,
  deleteCost,
};
