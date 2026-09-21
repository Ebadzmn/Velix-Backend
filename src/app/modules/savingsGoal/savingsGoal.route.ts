import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { SavingsGoalController } from './savingsGoal.controller';
import { SavingsGoalValidation } from './savingsGoal.validation';

const router = express.Router();

router.get(
  '/',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  SavingsGoalController.getAllSavingsGoals
);

router.post(
  '/',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(SavingsGoalValidation.createSavingsGoalZodSchema),
  SavingsGoalController.createSavingsGoal
);

router.get(
  '/:id',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  SavingsGoalController.getSavingsGoalById
);

router.put(
  '/:id',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(SavingsGoalValidation.updateSavingsGoalZodSchema),
  SavingsGoalController.updateSavingsGoal
);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  SavingsGoalController.deleteSavingsGoal
);

export const SavingsGoalRoutes = router;
