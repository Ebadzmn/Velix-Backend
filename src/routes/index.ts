import express from 'express';
import { AchievementController } from '../app/modules/achievement/achievement.controller';
import { AchievementRoutes } from '../app/modules/achievement/achievement.route';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { BudgetRoutes } from '../app/modules/budget/budget.route';
import { CostRoutes } from '../app/modules/cost/cost.route';
import { CostCategoryRoutes } from '../app/modules/costCategory/costCategory.route';
import { FinancialProfileRoutes } from '../app/modules/financialProfile/financialProfile.route';
import { FixedExpenseRoutes } from '../app/modules/fixedExpense/fixedExpense.route';
import { HomeRoutes } from '../app/modules/home/home.route';
import { IncomeRoutes } from '../app/modules/income/income.route';
import { InsightRoutes } from '../app/modules/insight/insight.route';
import { PopularServiceRoutes } from '../app/modules/popularService/popularService.route';
import { ProfileRoutes } from '../app/modules/profile/profile.route';
import { SavingsGoalRoutes } from '../app/modules/savingsGoal/savingsGoal.route';
import { SubscriptionRoutes } from '../app/modules/subscription/subscription.route';
import { SubscriptionCategoryRoutes } from '../app/modules/subscriptionCategory/subscriptionCategory.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { ENUM_USER_ROLE } from '../enums/user';
import auth from '../app/middlewares/auth';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/financial-profile',
    route: FinancialProfileRoutes,
  },
  {
    path: '/home',
    route: HomeRoutes,
  },
  {
    path: '/onboarding',
    route: FinancialProfileRoutes,
  },
  {
    path: '/subscriptions',
    route: SubscriptionRoutes,
  },
  {
    path: '/subscription-categories',
    route: SubscriptionCategoryRoutes,
  },
  {
    path: '/popular-services',
    route: PopularServiceRoutes,
  },
  {
    path: '/popular-service',
    route: PopularServiceRoutes,
  },
  {
    path: '/variable-costs',
    route: CostRoutes,
  },
  {
    path: '/costs',
    route: CostRoutes,
  },
  {
    path: '/cost-categories',
    route: CostCategoryRoutes,
  },
  {
    path: '/budget',
    route: BudgetRoutes,
  },
  {
    path: '/incomes',
    route: IncomeRoutes,
  },
  {
    path: '/fixed-expenses',
    route: FixedExpenseRoutes,
  },
  {
    path: '/savings-goals',
    route: SavingsGoalRoutes,
  },
  {
    path: '/profile',
    route: ProfileRoutes,
  },
  {
    path: '/achievements',
    route: AchievementRoutes,
  },
  {
    path: '/insights',
    route: InsightRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

router.get(
  '/financial-health',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AchievementController.getFinancialHealth
);

export default router;
