import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PopularServiceController } from './popularService.controller';
import { PopularServiceValidation } from './popularService.validation';

const router = express.Router();

router.get('/', PopularServiceController.getAllPopularServices);

router.get('/:id', PopularServiceController.getPopularServiceById);

router.post(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(PopularServiceValidation.createPopularServiceZodSchema),
  PopularServiceController.createPopularService
);

router.put(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(PopularServiceValidation.updatePopularServiceZodSchema),
  PopularServiceController.updatePopularService
);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  PopularServiceController.deletePopularService
);

export const PopularServiceRoutes = router;
