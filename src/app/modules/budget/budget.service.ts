import { Cost } from '../cost/cost.model';
import { FinancialProfile } from '../financialProfile/financialProfile.model';
import { FixedExpense } from '../fixedExpense/fixedExpense.model';
import { Income } from '../income/income.model';
import { SavingsGoal } from '../savingsGoal/savingsGoal.model';
import { Subscription } from '../subscription/subscription.model';
import { getFallbackSubscriptionInfo } from '../../../helpers/subscriptionDefaults';
import { User } from '../user/user.model';
import {
  IBudgetDashboardResponse,
  IFixedCostBreakdown,
  IVariableCostBreakdown,
} from './budget.interface';

const getDashboard = async (
  userId: string,
  targetMonth?: string
): Promise<IBudgetDashboardResponse> => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;

  let year = currentYear;
  let monthNum = currentMonthNum;

  if (targetMonth && targetMonth.includes('-')) {
    const [y, m] = targetMonth.split('-').map(Number);
    if (!isNaN(y) && !isNaN(m) && m >= 1 && m <= 12) {
      year = y;
      monthNum = m;
    }
  }

  const monthStr = `${year}-${String(monthNum).padStart(2, '0')}`;
  const startDate = new Date(year, monthNum - 1, 1, 0, 0, 0, 0);
  const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
  const totalDaysInMonth = endDate.getDate();

  // Days remaining calculation
  let daysLeft = 0;
  if (year === currentYear && monthNum === currentMonthNum) {
    daysLeft = Math.max(0, totalDaysInMonth - now.getDate() + 1);
  } else if (year > currentYear || (year === currentYear && monthNum > currentMonthNum)) {
    daysLeft = totalDaysInMonth;
  } else {
    daysLeft = 0;
  }

  // 1. Fetch User & Financial Profile
  const [user, finProfile, activeSavingsGoal, subscriptionsList, costsInMonth, fixedExpensesList] =
    await Promise.all([
      User.findById(userId),
      FinancialProfile.findOne({ user: userId }),
      SavingsGoal.findOne({ user: userId, is_active: true }),
      Subscription.find({ user: userId }),
      Cost.find({
        user: userId,
        date: { $gte: startDate, $lte: endDate },
      }),
      FixedExpense.find({ user: userId }),
    ]);

  const currency = user?.currency || 'SEK';

  // 2. Calculate Income
  let income = 0;
  if (finProfile) {
    income = (finProfile.monthlySalary || 0) + (finProfile.otherIncome || 0);
  }

  // Fallback to Income collection if finProfile has no income entries
  if (income === 0) {
    const incomesInMonth = await Income.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    });
    incomesInMonth.forEach((inc) => {
      income += inc.amount || 0;
    });
  }
  income = Number(income.toFixed(2));

  // 3. Calculate Fixed Expenses and Breakdown
  let fixed_expenses = 0;
  const fixed_costs: IFixedCostBreakdown[] = [];

  if (finProfile && finProfile.fixedCosts && finProfile.fixedCosts.length > 0) {
    finProfile.fixedCosts.forEach((fc) => {
      const amount = fc.amount || 0;
      fixed_expenses += amount;
      fixed_costs.push({
        category: fc.category,
        amount: Number(amount.toFixed(2)),
      });
    });
  } else if (fixedExpensesList && fixedExpensesList.length > 0) {
    fixedExpensesList.forEach((exp) => {
      const amount = exp.frequency === 'yearly' ? (exp.amount || 0) / 12 : exp.amount || 0;
      fixed_expenses += amount;
      fixed_costs.push({
        category: exp.category || exp.title,
        amount: Number(amount.toFixed(2)),
      });
    });
  }
  fixed_expenses = Number(fixed_expenses.toFixed(2));

  // 4. Calculate Subscriptions (Monthly Equivalent)
  let subscriptions = 0;
  subscriptionsList.forEach((sub) => {
    const period = sub.billing_period || (sub as any).billingPeriod;
    let price = sub.price || 0;
    if (price <= 0) {
      price = getFallbackSubscriptionInfo(sub.name).price;
    }
    if (period === 'yearly') {
      subscriptions += price / 12;
    } else {
      subscriptions += price;
    }
  });
  subscriptions = Number(subscriptions.toFixed(2));

  // 5. Calculate Variable Costs & Breakdown by Category
  let variable_costs = 0;
  const categoryMap = new Map<string, number>();

  costsInMonth.forEach((cost) => {
    const amount = cost.amount || 0;
    variable_costs += amount;
    const category = cost.category || 'Other';
    categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
  });
  variable_costs = Number(variable_costs.toFixed(2));

  const variable_costs_by_category: IVariableCostBreakdown[] = Array.from(
    categoryMap.entries()
  ).map(([category, amount]) => ({
    category,
    amount: Number(amount.toFixed(2)),
  }));

  // 6. Calculate Totals & Summary Metrics
  const total_expenses = Number(
    (fixed_expenses + subscriptions + variable_costs).toFixed(2)
  );
  const money_left = Math.max(0, Number((income - total_expenses).toFixed(2)));
  const safe_to_spend_today =
    daysLeft > 0 ? Math.round(money_left / daysLeft) : 0;
  const is_overspent = total_expenses > income;
  const overspent_amount = is_overspent
    ? Number((total_expenses - income).toFixed(2))
    : 0;

  // 7. Calculate Savings Goal
  const savingsTitle =
    activeSavingsGoal?.name || finProfile?.savingsGoal || 'Savings Goal';
  const monthlySavingsTarget = finProfile?.monthlySavings || 0;
  let targetAmount = activeSavingsGoal?.target_amount || 0;
  if (targetAmount <= 0) {
    targetAmount = monthlySavingsTarget > 0 ? monthlySavingsTarget * 10 : 10000;
  }
  const savedAmount = activeSavingsGoal?.saved_amount || 0;
  const progressPercentage =
    targetAmount > 0
      ? Number(
          Math.min(100, (savedAmount / targetAmount) * 100).toFixed(1)
        )
      : 0;

  // Auto-heal activeSavingsGoal in database if it was missing or had 0 target amount
  if (finProfile?.savingsGoal && (!activeSavingsGoal || activeSavingsGoal.target_amount <= 0)) {
    if (!activeSavingsGoal) {
      SavingsGoal.create({
        user: userId,
        name: finProfile.savingsGoal,
        target_amount: targetAmount,
        saved_amount: savedAmount,
        currency,
        is_active: true,
      }).catch(() => {});
    } else {
      SavingsGoal.findByIdAndUpdate(activeSavingsGoal._id, {
        target_amount: targetAmount,
      }).catch(() => {});
    }
  }

  const savings_goal = {
    title: savingsTitle,
    target_amount: targetAmount,
    saved_amount: savedAmount,
    monthly_savings_target: monthlySavingsTarget,
    progress_percentage: progressPercentage,
  };

  return {
    summary: {
      income,
      fixed_expenses,
      subscriptions,
      variable_costs,
      total_expenses,
      money_left,
      safe_to_spend_today,
      days_left: daysLeft,
      is_overspent,
      overspent_amount,
      currency,
    },
    savings_goal,
    breakdown: {
      fixed_costs,
      variable_costs_by_category,
    },
    currency,
    period: {
      month: monthStr,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      days_remaining: daysLeft,
    },
  };
};

export const BudgetService = {
  getDashboard,
};
