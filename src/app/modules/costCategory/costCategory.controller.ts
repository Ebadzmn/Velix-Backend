import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CostCategoryService } from './costCategory.service';

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CostCategoryService.getAllCategories();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Cost categories retrieved successfully',
    data: result,
  });
});

export const CostCategoryController = {
  getAllCategories,
};
