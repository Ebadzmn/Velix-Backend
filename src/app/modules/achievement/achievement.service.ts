import { BudgetService } from '../budget/budget.service';
import { FinancialProfile } from '../financialProfile/financialProfile.model';
import { Income } from '../income/income.model';
import { InsightService } from '../insight/insight.service';
import { SavingsGoal } from '../savingsGoal/savingsGoal.model';
import { Subscription } from '../subscription/subscription.model';
import { UserActivityService } from '../userActivity/userActivity.service';
import { IAchievementItem } from './achievement.interface';

const masterAchievementsList = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Added your first financial information',
    target: 1,
  },
  {
    id: 'savings_goal_set',
    title: 'Savings Goal Set',
    description: 'Created your first savings goal',
    target: 1,
  },
  {
    id: 'subscription_hunter',
    title: 'Subscription Hunter',
    description: 'Add and manage your subscriptions',
    target: 5,
  },
  {
    id: 'budget_master',
    title: 'Budget Master',
    description: 'Successfully manage your monthly budget',
    target: 100,
  },
  {
    id: 'financial_health_90',
    title: 'Financial Health 90+',
    description: 'Reach a financial health score of 90 or above',
    target: 90,
  },
  {
    id: 'streak_30',
    title: '30 Day Streak',
    description: 'Maintain a 30 day activity streak',
    target: 30,
  },
];

const calculateHealthAndAchievements = async (userId: string) => {
  const streakDays = await UserActivityService.calculateStreak(userId);
  const budgetDashboard = await BudgetService.getDashboard(userId);
  const finProfile = await FinancialProfile.findOne({ user: userId });

  const incomesCount = await Income.countDocuments({ user: userId });
  const savingsGoals = await SavingsGoal.find({ user: userId });
  const subscriptionsCount = await Subscription.countDocuments({ user: userId });

  const { income, total_expenses } = budgetDashboard.summary;

  // Single Source of Truth for Financial Health Score (0 - 100)
  const insightsData = await InsightService.getInsights(userId);
  const healthScore = insightsData.financial_health.score;

  // 2. Evaluate Achievements
  const hasFirstStep = incomesCount > 0 || finProfile != null;
  const hasSavingsGoal = savingsGoals.length > 0;

  const unlockedAchievements: IAchievementItem[] = [];
  const lockedAchievements: IAchievementItem[] = [];

  masterAchievementsList.forEach((master) => {
    let currentProgress = 0;
    let isUnlocked = false;

    if (master.id === 'first_step') {
      currentProgress = hasFirstStep ? 1 : 0;
      isUnlocked = hasFirstStep;
    } else if (master.id === 'savings_goal_set') {
      currentProgress = hasSavingsGoal ? 1 : 0;
      isUnlocked = hasSavingsGoal;
    } else if (master.id === 'subscription_hunter') {
      currentProgress = Math.min(master.target, subscriptionsCount);
      isUnlocked = subscriptionsCount >= master.target;
    } else if (master.id === 'budget_master') {
      const isBudgetHealthy = income > 0 && total_expenses <= income;
      currentProgress = isBudgetHealthy ? 100 : Math.round((income / Math.max(1, total_expenses)) * 100);
      isUnlocked = isBudgetHealthy && hasFirstStep;
    } else if (master.id === 'financial_health_90') {
      currentProgress = Math.min(master.target, healthScore);
      isUnlocked = healthScore >= master.target;
    } else if (master.id === 'streak_30') {
      currentProgress = Math.min(master.target, streakDays);
      isUnlocked = streakDays >= master.target;
    }

    const item: IAchievementItem = {
      id: master.id,
      title: master.title,
      description: master.description,
      progress: currentProgress,
      target: master.target,
      progress_percentage: Math.min(100, Math.round((currentProgress / master.target) * 100)),
      is_unlocked: isUnlocked,
      ...(isUnlocked ? { unlocked_at: new Date().toISOString() } : {}),
    };

    if (isUnlocked) {
      unlockedAchievements.push(item);
    } else {
      lockedAchievements.push(item);
    }
  });

  // 3. User Title Engine
  let userTitle = {
    key: 'financial_beginner',
    name: 'Financial Beginner',
  };

  const isUnlockedKey = (key: string) => unlockedAchievements.some((a) => a.id === key);

  if (healthScore >= 90 || streakDays >= 30) {
    userTitle = { key: 'financial_pro', name: 'Financial Pro' };
  } else if (isUnlockedKey('budget_master')) {
    userTitle = { key: 'budget_master', name: 'Budget Master' };
  } else if (isUnlockedKey('savings_goal_set')) {
    userTitle = { key: 'savings_builder', name: 'Savings Builder' };
  } else if (isUnlockedKey('subscription_hunter')) {
    userTitle = { key: 'subscription_hunter', name: 'Subscription Hunter' };
  } else if (isUnlockedKey('first_step')) {
    userTitle = { key: 'first_step', name: 'First Step' };
  }

  return {
    streakDays,
    healthScore,
    userTitle,
    unlockedAchievements,
    lockedAchievements,
  };
};

const getAchievementsList = async (userId: string, statusFilter?: string) => {
  const { streakDays, healthScore, unlockedAchievements, lockedAchievements } =
    await calculateHealthAndAchievements(userId);

  let items = [...unlockedAchievements, ...lockedAchievements];
  if (statusFilter === 'unlocked') {
    items = unlockedAchievements;
  } else if (statusFilter === 'locked') {
    items = lockedAchievements;
  }

  return {
    current_streak_days: streakDays,
    financial_health_score: healthScore,
    items,
  };
};

export const AchievementService = {
  calculateHealthAndAchievements,
  getAchievementsList,
};
