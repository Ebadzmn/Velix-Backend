export interface IHomeNextDraw {
  id?: string;
  name: string;
  amount: number;
  billing_date: string;
  next_billing_date: string;
  days_until: number;
  billing_period?: string;
  currency: string;
}

export interface IHomeSubscriptionItem {
  id?: string;
  name: string;
  amount: number;
  price: number;
  billing_period: string;
  currency: string;
  next_billing_date: string;
  days_until: number;
  category?: {
    id?: string;
    name?: string;
  } | string;
}

export interface IHomeFixedCostItem {
  id?: string;
  name: string;
  title: string;
  amount: number;
  category: string;
  frequency: string;
}

export interface IHomeSavingsGoalItem {
  id?: string;
  name: string;
  goal_name: string;
  saved_amount: number;
  current_saved_amount: number;
  target_amount: number;
  remaining_amount: number;
  progress_percentage: number;
  currency: string;
  target_date?: Date | string;
  is_active?: boolean;
}

export interface IHomeDashboardResponse {
  economic_health_score: number;
  amount_left_this_month: number;
  days_left_in_month: number;
  days_left_text: string;
  total_subscription_cost_per_month: number;
  next_draw: IHomeNextDraw | null;
  safe_to_spend_today: number;
  currency: string;
  subscriptions: IHomeSubscriptionItem[];
  fixed_costs: IHomeFixedCostItem[];
  savings_goals: IHomeSavingsGoalItem[];
  summary: {
    income: number;
    fixed_expenses: number;
    subscriptions: number;
    variable_costs: number;
    total_expenses: number;
    money_left: number;
    savings_allocated: number;
    available_to_spend: number;
    safe_to_spend_today: number;
  };
  economic_health: {
    score: number;
    max_score: number;
    status: string;
    description: string;
  };
  period: {
    month: string;
    start_date: string;
    end_date: string;
    days_remaining: number;
  };
}
