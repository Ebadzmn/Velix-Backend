export interface IBudgetSummary {
  income: number;
  fixed_expenses: number;
  subscriptions: number;
  variable_costs: number;
  total_expenses: number;
  money_left: number;
  safe_to_spend_today: number;
  days_left: number;
  is_overspent: boolean;
  overspent_amount: number;
  currency: string;
}

export interface ISavingsGoalResponse {
  title: string;
  target_amount: number;
  saved_amount: number;
  monthly_savings_target: number;
  progress_percentage: number;
}

export interface IFixedCostBreakdown {
  category: string;
  amount: number;
}

export interface IVariableCostBreakdown {
  category: string;
  amount: number;
}

export interface IBudgetBreakdown {
  fixed_costs: IFixedCostBreakdown[];
  variable_costs_by_category: IVariableCostBreakdown[];
}

export interface IBudgetPeriod {
  month: string;
  start_date: string;
  end_date: string;
  days_remaining: number;
}

export interface IBudgetDashboardResponse {
  summary: IBudgetSummary;
  savings_goal: ISavingsGoalResponse;
  breakdown: IBudgetBreakdown;
  currency: string;
  period: IBudgetPeriod;
}
