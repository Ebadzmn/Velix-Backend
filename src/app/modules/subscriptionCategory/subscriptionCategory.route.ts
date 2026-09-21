import express from 'express';
import { SubscriptionCategoryController } from './subscriptionCategory.controller';

const router = express.Router();

router.get('/', SubscriptionCategoryController.getAllCategories);

export const SubscriptionCategoryRoutes = router;
