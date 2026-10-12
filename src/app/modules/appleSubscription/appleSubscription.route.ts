import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { AppleSubscriptionController } from './appleSubscription.controller';

const router = express.Router();

router.post(
  '/verify',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AppleSubscriptionController.verifySubscription
);

router.get(
  '/status',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AppleSubscriptionController.getSubscriptionStatus
);

router.post(
  '/restore',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AppleSubscriptionController.restorePurchases
);

// App Store Server Notifications V2 Webhook (Called by Apple directly)
router.post(
  '/webhook',
  AppleSubscriptionController.handleWebhook
);

export const AppleSubscriptionRoutes = router;
