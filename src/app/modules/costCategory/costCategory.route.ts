import express from 'express';
import { CostCategoryController } from './costCategory.controller';

const router = express.Router();

router.get('/', CostCategoryController.getAllCategories);

export const CostCategoryRoutes = router;
