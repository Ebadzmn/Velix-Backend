import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PopularServiceService } from './popularService.service';

const createPopularService = catchAsync(async (req: Request, res: Response) => {
  const result = await PopularServiceService.createPopularService(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Popular service added successfully',
    data: result,
  });
});

const getAllPopularServices = catchAsync(async (req: Request, res: Response) => {
  const result = await PopularServiceService.getAllPopularServices(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Popular services retrieved successfully',
    data: result,
  });
});

const getPopularServiceById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await PopularServiceService.getPopularServiceById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Popular service details retrieved successfully',
    data: result,
  });
});

const updatePopularService = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await PopularServiceService.updatePopularService(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Popular service updated successfully',
    data: result,
  });
});

const deletePopularService = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await PopularServiceService.deletePopularService(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Popular service deleted successfully',
  });
});

export const PopularServiceController = {
  createPopularService,
  getAllPopularServices,
  getPopularServiceById,
  updatePopularService,
  deletePopularService,
};
