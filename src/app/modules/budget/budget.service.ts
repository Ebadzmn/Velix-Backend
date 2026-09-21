import { Cost } from '../cost/cost.model';
import { FinancialProfile } from '../financialProfile/financialProfile.model';
import { FixedExpense } from '../fixedExpense/fixedExpense.model';
import { Income } from '../income/income.model';
import { SavingsGoal } from '../savingsGoal/savingsGoal.model';
import { Subscription } from '../subscription/subscription.model';
import { User } from '../user/user.model';

const getDashboard = async (userId: string, targetMonth?: string) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;

  let year = currentYear;
  let monthNum = currentMonthNum;

  if (targetMonth && targetMonth.includes('-')) {
    const [y, m] = targetMonth.split('-').map(Number);
    if (!isNaN(y) && !isNaN(m)) {
      year = y;
      monthNum = m;
    }
  }

  const monthStr = `${year}-${String(monthNum).padStart(2, '0')}`;
  const startDate = new Date(year, monthNum - 1, 1, 0, 0, 0, 0);
  const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
  const totalDaysInMonth = endDate.getDate();

  let daysRemaining = 0;
  if (year === currentYear && monthNum === currentMonthNum) {
    daysRemaining = Math.max(0, totalDaysInMonth - now.getDate() + 1);
  } else if (year > currentYear || (year === currentYear && monthNum > currentMonthNum)) {
    daysRemaining = totalDaysInMonth;
  } else {
    daysRemaining = 0;
  }

  // 1. Fetch Currency
  const user = await User.findById(userId);
  const finProfile = await FinancialProfile.findOne({ user: userId });
  const currency = user?.currency || 'SEK';

  // 2. Calculate Income
  const incomesInMonth = await Income.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate },
  });

  let totalIncome = 0;
  incomesInMonth.forEach((inc) => {
    totalIncome += inc.amount;
  });

  if (totalIncome === 0 && finProfile) {
    totalIncome = (finProfile.monthlySalary || 0) + (finProfile.otherIncome || 0);
  }

  // 3. Calculate Fixed Expenses
  const fixedExpensesList = await FixedExpense.find({ user: userId });
  let totalFixedExpenses = 0;
  fixedExpensesList.forEach((exp) => {
    if (exp.frequency === 'yearly') {
      totalFixedExpenses += exp.amount / 12;
    } else {
      totalFixedExpenses += exp.amount;
    }
  });

  if (totalFixedExpenses === 0 && finProfile && finProfile.fixedCosts) {
    finProfile.fixedCosts.forEach((fc) => {
      totalFixedExpenses += fc.amount;
    });
  }

  // 4. Calculate Subscriptions (Monthly Equivalent)
  const subscriptionsList = await Subscription.find({ user: userId });
  let totalSubscriptions = 0;
  subscriptionsList.forEach((sub) => {
    if (sub.billing_period === 'yearly') {
      totalSubscriptions += sub.price / 12;
    } else {
      totalSubscriptions += sub.price;
    }
  });

  // 5. Calculate Variable Costs in Month
  const costsInMonth = await Cost.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate },
  });
  let totalVariableCosts = 0;
  costsInMonth.forEach((c) => {
    totalVariableCosts += c.amount;
  });

  // 6. Calculate Totals
  const totalExpenses = totalFixedExpenses + totalSubscriptions + totalVariableCosts;
  const moneyLeft = totalIncome - totalExpenses;

  // 7. Savings Allocation
  const savingsAllocated = finProfile?.monthlySavings || 0;
  const availableToSpend = moneyLeft - savingsAllocated;

  const safeToSpendToday =
    daysRemaining > 0 && availableToSpend > 0
      ? Number((availableToSpend / daysRemaining).toFixed(2))
      : 0;

  // 8. Warning Logic
  let warning = {
    show: false,
    type: null as string | null,
    amount: 0,
    message: null as string | null,
  };

  if (totalExpenses > totalIncome) {
    const overspent = totalExpenses - totalIncome;
    warning = {
      show: true,
      type: 'OVERSPENT',
      amount: Number(overspent.toFixed(2)),
      message: `You spent ${currency} ${overspent.toFixed(2)} more than your income this month.`,
    };
  }

  // 9. Savings Goal
  const activeSavingsGoal = await SavingsGoal.findOne({
    user: userId,
    is_active: true,
  });

  let savingsGoalData = null;
  if (activeSavingsGoal) {
    const progress = Math.min(
      100,
      Math.round((activeSavingsGoal.saved_amount / activeSavingsGoal.target_amount) * 100)
    );
    savingsGoalData = {
      id: activeSavingsGoal._id,
      name: activeSavingsGoal.name,
      target_amount: activeSavingsGoal.target_amount,
      saved_amount: activeSavingsGoal.saved_amount,
      remaining_amount: Math.max(
        0,
        activeSavingsGoal.target_amount - activeSavingsGoal.saved_amount
      ),
      progress_percentage: progress,
    };
  }

  return {
    currency,
    period: {
      month: monthStr,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      days_remaining: daysRemaining,
    },
    summary: {
      income: Number(totalIncome.toFixed(2)),
      fixed_expenses: Number(totalFixedExpenses.toFixed(2)),
      subscriptions: Number(totalSubscriptions.toFixed(2)),
      variable_costs: Number(totalVariableCosts.toFixed(2)),
      total_expenses: Number(totalExpenses.toFixed(2)),
      money_left: Number(moneyLeft.toFixed(2)),
      savings_allocated: Number(savingsAllocated.toFixed(2)),
      available_to_spend: Number(availableToSpend.toFixed(2)),
      safe_to_spend_today: safeToSpendToday,
    },
    warning,
    savings_goal: savingsGoalData,
  };
};

export const BudgetService = {
  getDashboard,
};
