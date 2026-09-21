import { BudgetService } from '../budget/budget.service';
import { FinancialProfile } from '../financialProfile/financialProfile.model';
import { FixedExpense } from '../fixedExpense/fixedExpense.model';
import { InsightService } from '../insight/insight.service';
import { SavingsGoal } from '../savingsGoal/savingsGoal.model';
import { Subscription } from '../subscription/subscription.model';
import { User } from '../user/user.model';
import {
  IHomeDashboardResponse,
  IHomeFixedCostItem,
  IHomeNextDraw,
  IHomeSavingsGoalItem,
  IHomeSubscriptionItem,
} from './home.interface';

const calculateNextBillingDate = (
  createdAt: Date | undefined,
  billingPeriod: 'monthly' | 'yearly',
  referenceDate: Date = new Date()
): { nextBillingDate: Date; formattedDate: string; daysUntil: number } => {
  const baseDate = createdAt ? new Date(createdAt) : new Date(referenceDate);
  const billingDay = baseDate.getDate();

  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth();
  const todayStart = new Date(refYear, refMonth, referenceDate.getDate(), 0, 0, 0, 0);

  let nextDate: Date;

  if (billingPeriod === 'yearly') {
    const billingMonth = baseDate.getMonth();
    const maxDays = new Date(refYear, billingMonth + 1, 0).getDate();
    const targetDay = Math.min(billingDay, maxDays);
    const candidateThisYear = new Date(refYear, billingMonth, targetDay, 0, 0, 0, 0);

    if (candidateThisYear.getTime() >= todayStart.getTime()) {
      nextDate = candidateThisYear;
    } else {
      const maxDaysNextYear = new Date(refYear + 1, billingMonth + 1, 0).getDate();
      nextDate = new Date(refYear + 1, billingMonth, Math.min(billingDay, maxDaysNextYear), 0, 0, 0, 0);
    }
  } else {
    // Monthly
    const maxDaysThisMonth = new Date(refYear, refMonth + 1, 0).getDate();
    const targetDay = Math.min(billingDay, maxDaysThisMonth);
    const candidateThisMonth = new Date(refYear, refMonth, targetDay, 0, 0, 0, 0);

    if (candidateThisMonth.getTime() >= todayStart.getTime()) {
      nextDate = candidateThisMonth;
    } else {
      const maxDaysNextMonth = new Date(refYear, refMonth + 2, 0).getDate();
      nextDate = new Date(refYear, refMonth + 1, Math.min(billingDay, maxDaysNextMonth), 0, 0, 0, 0);
    }
  }

  const diffTime = nextDate.getTime() - todayStart.getTime();
  const daysUntil = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const formattedDate = nextDate.toISOString().split('T')[0];

  return { nextBillingDate: nextDate, formattedDate, daysUntil };
};

const getHomeDashboard = async (
  userId: string,
  targetMonth?: string
): Promise<IHomeDashboardResponse> => {
  const [user, budgetDashboard, insightsData, subscriptionsRaw, fixedExpensesRaw, savingsGoalsRaw, finProfile] =
    await Promise.all([
      User.findById(userId),
      BudgetService.getDashboard(userId, targetMonth),
      InsightService.getInsights(userId, targetMonth),
      Subscription.find({ user: userId }).sort({ createdAt: -1 }),
      FixedExpense.find({ user: userId }).sort({ createdAt: -1 }),
      SavingsGoal.find({ user: userId }).sort({ is_active: -1, createdAt: -1 }),
      FinancialProfile.findOne({ user: userId }),
    ]);

  const currency = user?.currency || budgetDashboard.currency || 'SEK';
  const now = new Date();

  // 1. Format Subscriptions & Compute Next Billing Dates
  let calculatedNextDraw: IHomeNextDraw | null = null;
  let minDaysUntil = Number.MAX_SAFE_INTEGER;

  const subscriptions: IHomeSubscriptionItem[] = subscriptionsRaw.map((sub) => {
    const { formattedDate, daysUntil } = calculateNextBillingDate(
      sub.createdAt,
      sub.billing_period,
      now
    );

    if (daysUntil < minDaysUntil) {
      minDaysUntil = daysUntil;
      calculatedNextDraw = {
        id: sub._id?.toString(),
        name: sub.name,
        amount: sub.price,
        billing_date: formattedDate,
        next_billing_date: formattedDate,
        days_until: daysUntil,
        billing_period: sub.billing_period,
        currency: sub.currency || currency,
      };
    }

    return {
      id: sub._id?.toString(),
      name: sub.name,
      amount: sub.price,
      price: sub.price,
      billing_period: sub.billing_period,
      currency: sub.currency || currency,
      next_billing_date: formattedDate,
      days_until: daysUntil,
      category: sub.category as unknown as IHomeSubscriptionItem['category'],
    };
  });

  // Sort subscriptions by upcoming billing date (nearest first)
  subscriptions.sort((a, b) => a.days_until - b.days_until);

  // 2. Format Fixed Costs (with fallback to onboarding profile if no standalone records)
  let fixed_costs: IHomeFixedCostItem[] = fixedExpensesRaw.map((fe) => ({
    id: fe._id?.toString(),
    name: fe.title,
    title: fe.title,
    amount: fe.amount,
    category: fe.category || 'General',
    frequency: fe.frequency || 'monthly',
  }));

  if (fixed_costs.length === 0 && finProfile && finProfile.fixedCosts && finProfile.fixedCosts.length > 0) {
    fixed_costs = finProfile.fixedCosts.map((fc: any) => ({
      id: fc._id?.toString(),
      name: fc.category,
      title: fc.category,
      amount: fc.amount,
      category: fc.category,
      frequency: 'monthly',
    }));
  }

  // 3. Format Savings Goals
  let savings_goals: IHomeSavingsGoalItem[] = savingsGoalsRaw.map((sg) => {
    const target = sg.target_amount || 1;
    const saved = sg.saved_amount || 0;
    const progress = Math.min(100, Math.round((saved / target) * 100));

    return {
      id: sg._id?.toString(),
      name: sg.name,
      goal_name: sg.name,
      saved_amount: saved,
      current_saved_amount: saved,
      target_amount: sg.target_amount,
      remaining_amount: Math.max(0, sg.target_amount - saved),
      progress_percentage: progress,
      currency: sg.currency || currency,
      target_date: sg.target_date,
      is_active: sg.is_active,
    };
  });

  if (savings_goals.length === 0 && finProfile && finProfile.savingsGoal) {
    savings_goals = [
      {
        name: finProfile.savingsGoal,
        goal_name: finProfile.savingsGoal,
        saved_amount: 0,
        current_saved_amount: 0,
        target_amount: finProfile.monthlySavings || 0,
        remaining_amount: finProfile.monthlySavings || 0,
        progress_percentage: 0,
        currency,
        is_active: true,
      },
    ];
  }

  // 4. Extract Dashboard & Health Metrics
  const daysLeftInMonth = budgetDashboard.period.days_remaining;
  const daysLeftText =
    daysLeftInMonth === 1 ? '1 day left' : `${daysLeftInMonth} days left`;

  const totalSubCostPerMonth = budgetDashboard.summary.subscriptions;
  const amountLeftThisMonth = budgetDashboard.summary.money_left;
  const safeToSpendToday = budgetDashboard.summary.safe_to_spend_today;
  const economicHealthScore = insightsData.financial_health.score;

  return {
    economic_health_score: economicHealthScore,
    amount_left_this_month: amountLeftThisMonth,
    days_left_in_month: daysLeftInMonth,
    days_left_text: daysLeftText,
    total_subscription_cost_per_month: totalSubCostPerMonth,
    next_draw: calculatedNextDraw,
    safe_to_spend_today: safeToSpendToday,
    currency,
    subscriptions,
    fixed_costs,
    savings_goals,
    summary: {
      income: budgetDashboard.summary.income,
      fixed_expenses: budgetDashboard.summary.fixed_expenses,
      subscriptions: budgetDashboard.summary.subscriptions,
      variable_costs: budgetDashboard.summary.variable_costs,
      total_expenses: budgetDashboard.summary.total_expenses,
      money_left: budgetDashboard.summary.money_left,
      savings_allocated: finProfile?.monthlySavings || 0,
      available_to_spend: Math.max(
        0,
        budgetDashboard.summary.money_left - (finProfile?.monthlySavings || 0)
      ),
      safe_to_spend_today: budgetDashboard.summary.safe_to_spend_today,
    },
    economic_health: {
      score: economicHealthScore,
      max_score: insightsData.financial_health.max_score,
      status: insightsData.financial_health.status,
      description: insightsData.financial_health.description,
    },
    period: budgetDashboard.period,
  };
};

export const HomeService = {
  getHomeDashboard,
  calculateNextBillingDate,
};
