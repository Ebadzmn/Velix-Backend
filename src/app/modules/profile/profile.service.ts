import ApiError from '../../../errors/ApiError';
import { AchievementService } from '../achievement/achievement.service';
import { BudgetService } from '../budget/budget.service';
import { User } from '../user/user.model';

const getDashboard = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const budgetDashboard = await BudgetService.getDashboard(userId);
  const {
    streakDays,
    healthScore,
    userTitle,
    unlockedAchievements,
    lockedAchievements,
  } = await AchievementService.calculateHealthAndAchievements(userId);

  return {
    user: {
      id: user._id,
      name: user.name || `${user.firstName} ${user.lastName}`,
      title: userTitle,
    },
    financial_summary: {
      period: budgetDashboard.period.month,
      currency: budgetDashboard.currency,
      income_per_month: budgetDashboard.summary.income,
      left_amount: budgetDashboard.summary.money_left,
      subscription_total: budgetDashboard.summary.subscriptions,
    },
    achievements_summary: {
      current_streak_days: streakDays,
      financial_health_score: healthScore,
      unlocked_count: unlockedAchievements.length,
      locked_count: lockedAchievements.length,
    },
    achievements: {
      unlocked: unlockedAchievements,
      locked: lockedAchievements,
    },
  };
};

const getMyProfile = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

const updateProfile = async (userId: string, payload: Partial<any>) => {
  const user = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

export const ProfileService = {
  getDashboard,
  getMyProfile,
  updateProfile,
};
