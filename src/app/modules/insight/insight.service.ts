import { BudgetService } from '../budget/budget.service';
import { FinancialProfile } from '../financialProfile/financialProfile.model';
import { FixedExpense } from '../fixedExpense/fixedExpense.model';
import { SavingsGoal } from '../savingsGoal/savingsGoal.model';
import { Subscription } from '../subscription/subscription.model';
import { ISmartInsight } from './insight.interface';

const getInsights = async (userId: string, targetMonth?: string) => {
  // 1. Fetch Budget & Financial Context
  const budgetDashboard = await BudgetService.getDashboard(userId, targetMonth);
  const finProfile = await FinancialProfile.findOne({ user: userId });
  const fixedExpensesList = await FixedExpense.find({ user: userId });
  const subscriptionsList = await Subscription.find({ user: userId });
  const savingsGoals = await SavingsGoal.find({ user: userId });

  const currency = budgetDashboard.currency;
  const income = budgetDashboard.summary.income;
  const totalExpenses = budgetDashboard.summary.total_expenses;
  const moneyLeft = budgetDashboard.summary.money_left;
  const subscriptionTotalMonthly = budgetDashboard.summary.subscriptions;
  const fixedExpensesTotalMonthly = budgetDashboard.summary.fixed_expenses;

  // 2. Calculate Savings Score (30 Max)
  let savingsScore = 5;
  const activeGoal = savingsGoals.find((g) => g.is_active) || savingsGoals[0];

  if (activeGoal && activeGoal.target_amount > 0) {
    const ratio = Math.min(1, activeGoal.saved_amount / activeGoal.target_amount);
    savingsScore = Math.round(ratio * 30);
  } else if (finProfile && finProfile.monthlySavings > 0) {
    savingsScore = 20;
  }

  // 3. Calculate Subscription Control Score (25 Max)
  const subRatio = income > 0 ? (subscriptionTotalMonthly / income) * 100 : 0;
  let subscriptionScore = 25;

  if (subRatio <= 5) {
    subscriptionScore = 25;
  } else if (subRatio <= 10) {
    subscriptionScore = 20;
  } else if (subRatio <= 20) {
    subscriptionScore = 15;
  } else if (subRatio <= 40) {
    subscriptionScore = 10;
  } else {
    subscriptionScore = 5;
  }

  // 4. Calculate Budget Control Score (45 Max)
  let budgetScore = 25;
  if (income > 0) {
    const percentageLeft = (moneyLeft / income) * 100;
    if (percentageLeft > 20) {
      budgetScore = 45;
    } else if (percentageLeft >= 10) {
      budgetScore = 35;
    } else if (percentageLeft >= 0) {
      budgetScore = 25;
    } else if (percentageLeft >= -10) {
      budgetScore = 10;
    } else {
      budgetScore = 0;
    }
  }

  const totalHealthScore = Math.min(
    100,
    Math.max(0, savingsScore + subscriptionScore + budgetScore)
  );

  let status = 'Good';
  let description = 'Your finances are in a fairly healthy position.';

  if (totalHealthScore >= 80) {
    status = 'Excellent';
    description = 'Your finances are in an exceptional position!';
  } else if (totalHealthScore >= 65) {
    status = 'Good';
    description = 'Your finances are in a fairly healthy position.';
  } else if (totalHealthScore >= 50) {
    status = 'Fair';
    description = 'Your finances are stable, but there is room for improvement.';
  } else {
    status = 'Needs Attention';
    description = 'Your expenses exceed optimal levels. Review your budget.';
  }

  // 5. Generate Smart Insights Rules Engine
  const smartInsights: ISmartInsight[] = [];

  // Rule 1 — Active Subscriptions Summary
  if (subscriptionsList.length > 0) {
    const yearlySubTotal = Number((subscriptionTotalMonthly * 12).toFixed(2));
    smartInsights.push({
      id: 'active_subscriptions',
      type: 'info',
      priority: 1,
      title: 'Subscription Summary',
      message: `You have ${subscriptionsList.length} active subscriptions that cost ${currency} ${subscriptionTotalMonthly}/month — ${currency} ${yearlySubTotal} per year.`,
      action: {
        type: 'navigate',
        screen: 'subscriptions',
        label: 'View subscriptions',
      },
    });
  }

  // Rule 2 — Fixed Expenses Summary
  const fixedCount = fixedExpensesList.length || (finProfile?.fixedCosts?.length || 0);
  if (fixedCount > 0) {
    smartInsights.push({
      id: 'fixed_cost_summary',
      type: 'info',
      priority: 2,
      title: 'Fixed Costs',
      message: `Your fixed monthly costs amount to ${currency} ${fixedExpensesTotalMonthly}/month (${fixedCount} ${
        fixedCount === 1 ? 'item' : 'items'
      }).`,
      action: {
        type: 'navigate',
        screen: 'fixed_expenses',
        label: 'View fixed costs',
      },
    });
  }

  // Rule 3 — High Subscription Cost Warning (if subRatio > 10%)
  if (subRatio > 10 && income > 0) {
    smartInsights.push({
      id: 'subscription_income_ratio',
      type: 'warning',
      priority: 3,
      title: 'High Subscription Cost',
      message: `Your subscriptions make up ${subRatio.toFixed(
        1
      )}% of your income. Experts recommend keeping recurring subscription costs under 10% of income.`,
      metrics: {
        subscription_amount: subscriptionTotalMonthly,
        income_amount: income,
        percentage: Number(subRatio.toFixed(1)),
        recommended_percentage: 10,
      },
    });
  }

  // Rule 4 — Overspending Alert (if totalExpenses > income)
  if (totalExpenses > income && income > 0) {
    const difference = Number((totalExpenses - income).toFixed(2));
    smartInsights.push({
      id: 'overspending',
      type: 'danger',
      priority: 4,
      title: 'Overspending Alert',
      message: `Warning: you have spent ${currency} ${difference} more than your income this month. Review your expenses.`,
      metrics: {
        income,
        expenses: totalExpenses,
        difference,
      },
      action: {
        type: 'navigate',
        screen: 'budget',
        label: 'Review budget',
      },
    });
  }

  // Rule 5 — Most Expensive Subscription
  if (subscriptionsList.length > 0) {
    let mostExpensive = subscriptionsList[0];
    let maxMonthlyEquivalent =
      mostExpensive.billing_period === 'yearly'
        ? mostExpensive.price / 12
        : mostExpensive.price;

    subscriptionsList.forEach((s) => {
      const eq = s.billing_period === 'yearly' ? s.price / 12 : s.price;
      if (eq > maxMonthlyEquivalent) {
        maxMonthlyEquivalent = eq;
        mostExpensive = s;
      }
    });

    const subMonthlyCost = Number(maxMonthlyEquivalent.toFixed(2));
    const subYearlyCost = Number((subMonthlyCost * 12).toFixed(2));

    smartInsights.push({
      id: 'most_expensive_subscription',
      type: 'info',
      priority: 5,
      title: 'Most Expensive Subscription',
      message: `${mostExpensive.name} is your most expensive subscription at ${currency} ${subMonthlyCost}/month — that's ${currency} ${subYearlyCost} per year.`,
      metrics: {
        subscription_id: mostExpensive._id,
        name: mostExpensive.name,
        monthly_cost: subMonthlyCost,
        yearly_cost: subYearlyCost,
      },
    });
  }

  // Rule 6 — Savings Goal Projection
  if (activeGoal && activeGoal.target_amount > 0) {
    const remainingAmount = Math.max(0, activeGoal.target_amount - activeGoal.saved_amount);
    const monthlySaving = finProfile?.monthlySavings || 500;
    const estimatedMonths = monthlySaving > 0 ? Math.ceil(remainingAmount / monthlySaving) : 0;

    smartInsights.push({
      id: 'savings_goal_projection',
      type: 'success',
      priority: 6,
      title: 'Savings Goal Progress',
      message: `With ${currency} ${monthlySaving}/month in savings, you will reach the "${activeGoal.name}" goal in about ${estimatedMonths} ${
        estimatedMonths === 1 ? 'month' : 'months'
      }.`,
      metrics: {
        goal_id: activeGoal._id,
        goal_name: activeGoal.name,
        target_amount: activeGoal.target_amount,
        current_amount: activeGoal.saved_amount,
        monthly_saving: monthlySaving,
        estimated_months: estimatedMonths,
      },
    });
  }

  // Sort insights by priority
  smartInsights.sort((a, b) => a.priority - b.priority);

  return {
    period: budgetDashboard.period,
    currency,
    financial_health: {
      score: totalHealthScore,
      max_score: 100,
      status,
      description,
    },
    points_breakdown: {
      savings: {
        score: savingsScore,
        max_score: 30,
        percentage: Number(((savingsScore / 30) * 100).toFixed(2)),
      },
      subscription_control: {
        score: subscriptionScore,
        max_score: 25,
        percentage: Number(((subscriptionScore / 25) * 100).toFixed(2)),
        subscription_income_ratio: Number(subRatio.toFixed(2)),
      },
      budget_control: {
        score: budgetScore,
        max_score: 45,
        percentage: Number(((budgetScore / 45) * 100).toFixed(2)),
      },
    },
    smart_insights: smartInsights,
  };
};

export const InsightService = {
  getInsights,
};
