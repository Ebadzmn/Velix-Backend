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
    title: 'First step',
    description: 'Completed onboarding and got started with Koll',
    emoji: '🎯',
    category: 'onboarding' as const,
    target: 1,
  },
  {
    id: 'savings_goal_set',
    title: 'Savings goal set',
    description: 'Created your first savings goal',
    emoji: '💎',
    category: 'savings' as const,
    target: 1,
  },
  {
    id: 'subscription_hunter',
    title: 'Subscription hunter',
    description: 'Have 5 or more active subscriptions',
    emoji: '🔍',
    category: 'subscriptions' as const,
    target: 5,
  },
  {
    id: 'budget_master',
    title: 'Budget Master',
    description: 'Achieved financial health of 80 or more',
    emoji: '🏆',
    category: 'health' as const,
    target: 80,
  },
  {
    id: 'financial_health_90',
    title: 'Financial health 90+',
    description: 'Achieved amazing financial health',
    emoji: '⭐',
    category: 'health' as const,
    target: 90,
  },
  {
    id: 'streak_30_days',
    title: '30 day streak',
    description: 'Opened the app 30 days in a row',
    emoji: '🔥',
    category: 'streak' as const,
    target: 30,
  },
  {
    id: 'savings_hero',
    title: 'Savings hero',
    description: 'Reached 50% of a savings goal',
    emoji: '💰',
    category: 'savings' as const,
    target: 50,
  },
];

const calculateHealthAndAchievements = async (userId: string) => {
  const streakDetails = await UserActivityService.calculateStreakDetails(userId);
  const finProfile = await FinancialProfile.findOne({ user: userId });
  const incomesCount = await Income.countDocuments({ user: userId });
  const savingsGoals = await SavingsGoal.find({ user: userId });
  const subscriptionsCount = await Subscription.countDocuments({ user: userId });

  // Single Source of Truth for Financial Health Score (0 - 100)
  const insightsData = await InsightService.getInsights(userId);
  const healthScore = insightsData.financial_health.score;

  // 2. Evaluate Achievements
  const hasFirstStep = incomesCount > 0 || finProfile != null;
  const hasSavingsGoal = savingsGoals.length > 0;

  // Savings hero check (50% of any savings goal)
  let maxGoalPercentage = 0;
  savingsGoals.forEach((goal) => {
    if (goal.target_amount > 0) {
      const pct = Math.round((goal.saved_amount / goal.target_amount) * 100);
      if (pct > maxGoalPercentage) maxGoalPercentage = pct;
    }
  });

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
      currentProgress = subscriptionsCount;
      isUnlocked = subscriptionsCount >= master.target;
    } else if (master.id === 'budget_master') {
      currentProgress = healthScore;
      isUnlocked = healthScore >= master.target;
    } else if (master.id === 'financial_health_90') {
      currentProgress = healthScore;
      isUnlocked = healthScore >= master.target;
    } else if (master.id === 'streak_30_days') {
      currentProgress = streakDetails.currentStreak;
      isUnlocked = streakDetails.currentStreak >= master.target;
    } else if (master.id === 'savings_hero') {
      currentProgress = Math.min(master.target, maxGoalPercentage);
      isUnlocked = maxGoalPercentage >= master.target;
    }

    const percentage = Number(
      Math.min(100, (currentProgress / master.target) * 100).toFixed(1)
    );

    const item: IAchievementItem = {
      id: master.id,
      title: master.title,
      description: master.description,
      emoji: master.emoji,
      category: master.category,
      is_unlocked: isUnlocked,
      ...(isUnlocked ? { unlocked_at: new Date().toISOString() } : {}),
      ...(!isUnlocked
        ? {
            progress: {
              current: currentProgress,
              target: master.target,
              percentage,
            },
          }
        : {}),
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

  if (healthScore >= 90 || streakDetails.currentStreak >= 30) {
    userTitle = { key: 'financial_pro', name: 'Financial Pro' };
  } else if (isUnlockedKey('budget_master')) {
    userTitle = { key: 'budget_master', name: 'Budget Master' };
  } else if (isUnlockedKey('savings_hero') || isUnlockedKey('savings_goal_set')) {
    userTitle = { key: 'savings_builder', name: 'Savings Builder' };
  } else if (isUnlockedKey('subscription_hunter')) {
    userTitle = { key: 'subscription_hunter', name: 'Subscription Hunter' };
  } else if (isUnlockedKey('first_step')) {
    userTitle = { key: 'first_step', name: 'First Step' };
  }

  const streakSummary = {
    current_streak_days: streakDetails.currentStreak,
    longest_streak_days: streakDetails.longestStreak,
    last_activity_date: streakDetails.lastActivityDate,
    streak_title: `${streakDetails.currentStreak} day streak`,
    streak_message: 'Open the app every day to build your streak',
  };

  const totalAchievements = masterAchievementsList.length;
  const unlockedCount = unlockedAchievements.length;
  const lockedCount = lockedAchievements.length;
  const progressPercentage = Number(
    ((unlockedCount / totalAchievements) * 100).toFixed(1)
  );

  return {
    streakDays: streakDetails.currentStreak,
    streak: streakSummary,
    healthScore,
    userTitle,
    summary: {
      total_achievements: totalAchievements,
      unlocked_count: unlockedCount,
      locked_count: lockedCount,
      progress_percentage: progressPercentage,
    },
    unlockedAchievements,
    lockedAchievements,
  };
};

const getAchievementsDashboard = async (userId: string) => {
  const data = await calculateHealthAndAchievements(userId);

  return {
    streak: data.streak,
    financial_health: {
      score: data.healthScore,
      max_score: 100,
      percentage: Number(((data.healthScore / 100) * 100).toFixed(1)),
    },
    summary: data.summary,
    unlocked: data.unlockedAchievements,
    locked: data.lockedAchievements,
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

const recordStreakHeartbeat = async (userId: string) => {
  const streakDetails = await UserActivityService.calculateStreakDetails(userId);
  const isNewMilestone = [3, 7, 14, 30, 60, 100].includes(streakDetails.currentStreak);

  return {
    current_streak_days: streakDetails.currentStreak,
    is_new_milestone: isNewMilestone,
  };
};

export const AchievementService = {
  calculateHealthAndAchievements,
  getAchievementsDashboard,
  getAchievementsList,
  recordStreakHeartbeat,
};
