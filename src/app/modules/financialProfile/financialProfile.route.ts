import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { FinancialProfileController } from './financialProfile.controller';
import { FinancialProfileValidation } from './financialProfile.validation';

const router = express.Router();

router.post(
  '/',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(FinancialProfileValidation.createOrUpdateFinancialProfileZodSchema),
  FinancialProfileController.createOrUpdateProfile
);

router.get(
  '/me',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  FinancialProfileController.getMyProfile
);

export const FinancialProfileRoutes = router;
