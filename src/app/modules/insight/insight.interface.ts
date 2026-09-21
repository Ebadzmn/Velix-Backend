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

export type IPointsBreakdown = {
  savings: {
    score: number;
    max_score: number;
    percentage: number;
  };
  subscription_control: {
    score: number;
    max_score: number;
    percentage: number;
    subscription_income_ratio?: number;
  };
  budget_control: {
    score: number;
    max_score: number;
    percentage: number;
  };
};
