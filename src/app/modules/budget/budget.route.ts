import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { BudgetController } from './budget.controller';

const router = express.Router();

router.get(
  '/dashboard',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  BudgetController.getDashboard
);

export const BudgetRoutes = router;
