import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { FixedExpenseController } from './fixedExpense.controller';
import { FixedExpenseValidation } from './fixedExpense.validation';

const router = express.Router();

router.get(
  '/',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  FixedExpenseController.getAllFixedExpenses
);

router.post(
  '/',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(FixedExpenseValidation.createFixedExpenseZodSchema),
  FixedExpenseController.createFixedExpense
);

router.get(
  '/:id',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  FixedExpenseController.getFixedExpenseById
);

router.put(
  '/:id',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(FixedExpenseValidation.updateFixedExpenseZodSchema),
  FixedExpenseController.updateFixedExpense
);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  FixedExpenseController.deleteFixedExpense
);

export const FixedExpenseRoutes = router;
