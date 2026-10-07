export type IInsightAction = {
  type: 'navigate' | 'external_link' | 'action';
  screen: string;
  label: string;
};

export type ISmartInsight = {
  id: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  priority: number;
  title: string;
  message: string;
  metrics?: Record<string, unknown>;
  action?: IInsightAction;
};

export type IFinancialHealthBreakdown = {
  score: number;
  max_score: number;
  status: string;
  description: string;
};

export type IQuickMetricStats = {
  subscription_count: number;
  yearly_subscription_cost: number;
  yearly_subscription_cost_formatted: string;
  subscription_income_percentage: number;
};

export type IPointsBreakdown = {
  savings: {
    score: number;
    max_score: number;
    percentage: number;
    title: string;
    description: string;
  };
  subscription_control: {
    score: number;
    max_score: number;
    percentage: number;
    subscription_income_ratio?: number;
    title: string;
    description: string;
  };
  budget_control: {
    score: number;
    max_score: number;
    percentage: number;
    title: string;
    description: string;
  };
};
