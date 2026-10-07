# Smart Financial Insights API Documentation

## Overview
This API powers the **Insights** screen (`insights_page.dart` & `insights_controller.dart`). It analyzes the user's income, expenses, subscriptions, fixed costs, and savings goals to generate:
1. **Economic Health Score Card (Hero Purple Card)**: 0 - 100 Score with Status Badge (`Good`, `Improve`, `Fair`, `Needs Attention`).
2. **Points Breakdown (Scoring Breakdown)**: 3 categorized scoring pillars:
   - `Savings quota` (Max 30 pts)
   - `Subscription control` (Max 25 pts)
   - `Budget control` (Max 45 pts)
3. **Quick Metric Stats (3 Metric Cards)**:
   - `Subscription Count` (e.g. 3 active subscriptions)
   - `A Year` (Annual cost, e.g. 4,644 SEK)
   - `Of Income` (Subscription percentage of total income, e.g. 5.2%)
4. **Smart Insights Recommendations**: Automated actionable tips, warnings, and notifications.
5. **AI Coach Integration**: Prompt and routing metadata for direct AI financial coaching.

---

## Endpoint Details

- **Route:** `/api/v1/insights` *(also available via `/api/v1/smart-insights`)*
- **HTTP Method:** `GET`
- **Access / Permission:** Private (`Bearer <USER_JWT_TOKEN>`)
- **Query Parameters (Optional):**
  - `month` (e.g. `?month=2026-08` - defaults to current month if omitted)

### Headers
```http
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

---

## Response Structure (200 OK)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Financial insights fetched successfully",
  "data": {
    "period": {
      "month": "2026-08",
      "days_in_month": 31,
      "days_elapsed": 26,
      "days_remaining": 5
    },
    "currency": "SEK",
    "financial_health": {
      "score": 78,
      "max_score": 100,
      "status": "Good",
      "description": "Your finances are in a fairly healthy position."
    },
    "points_breakdown": {
      "savings": {
        "title": "Savings quota",
        "description": "Percentage of income allocated towards savings and goals",
        "score": 20,
        "max_score": 30,
        "percentage": 66.67
      },
      "subscription_control": {
        "title": "Subscription control",
        "description": "Subscription spending efficiency relative to income",
        "score": 25,
        "max_score": 25,
        "percentage": 100,
        "subscription_income_ratio": 5.2
      },
      "budget_control": {
        "title": "Budget control",
        "description": "Remaining budget and adherence to spending limits",
        "score": 33,
        "max_score": 45,
        "percentage": 73.33
      }
    },
    "quick_metric_stats": {
      "subscription_count": 3,
      "yearly_subscription_cost": 4644,
      "yearly_subscription_cost_formatted": "4,644 SEK",
      "subscription_income_percentage": 5.2
    },
    "ai_coach": {
      "action": "chat",
      "screen": "ai_coach_screen",
      "suggested_prompt": "I have an economic health score of 78/100 with status \"Good\". My subscriptions cost 4644 SEK/year (5.2% of my income). How can I optimize my budget?"
    },
    "smart_insights": [
      {
        "id": "active_subscriptions",
        "type": "info",
        "priority": 1,
        "title": "Subscription Summary",
        "message": "You have 3 active subscriptions that cost SEK 387/month — SEK 4644 per year.",
        "metrics": {
          "count": 3,
          "monthly_cost": 387,
          "yearly_cost": 4644
        },
        "action": {
          "type": "navigate",
          "screen": "subscriptions_screen",
          "label": "Review Subscriptions"
        }
      },
      {
        "id": "savings_goal_projection",
        "type": "success",
        "priority": 6,
        "title": "Savings Goal Progress",
        "message": "With SEK 1000/month in savings, you will reach the \"Emergency Fund\" goal in about 4 months.",
        "metrics": {
          "goal_name": "Emergency Fund",
          "target_amount": 5000,
          "current_amount": 1000,
          "monthly_saving": 1000,
          "estimated_months": 4
        }
      }
    ]
  }
}
```

---

## Flutter Integration (`insights_controller.dart` & `insights_page.dart`)

### 1. Data Model
```dart
class FinancialHealthData {
  final int score;
  final int maxScore;
  final String status;
  final String description;

  FinancialHealthData({
    required this.score,
    required this.maxScore,
    required this.status,
    required this.description,
  });

  factory FinancialHealthData.fromJson(Map<String, dynamic> json) => FinancialHealthData(
    score: json['score'] ?? 0,
    maxScore: json['max_score'] ?? 100,
    status: json['status'] ?? 'Good',
    description: json['description'] ?? '',
  );
}

class QuickMetricStats {
  final int subscriptionCount;
  final double yearlyCost;
  final String yearlyCostFormatted;
  final double subscriptionIncomePercentage;

  QuickMetricStats({
    required this.subscriptionCount,
    required this.yearlyCost,
    required this.yearlyCostFormatted,
    required this.subscriptionIncomePercentage,
  });

  factory QuickMetricStats.fromJson(Map<String, dynamic> json) => QuickMetricStats(
    subscriptionCount: json['subscription_count'] ?? 0,
    yearlyCost: (json['yearly_subscription_cost'] ?? 0).toDouble(),
    yearlyCostFormatted: json['yearly_subscription_cost_formatted'] ?? '0',
    subscriptionIncomePercentage: (json['subscription_income_percentage'] ?? 0).toDouble(),
  );
}

class PointsBreakdownCategory {
  final String title;
  final String description;
  final int score;
  final int maxScore;
  final double percentage;

  PointsBreakdownCategory({
    required this.title,
    required this.description,
    required this.score,
    required this.maxScore,
    required this.percentage,
  });

  factory PointsBreakdownCategory.fromJson(Map<String, dynamic> json) => PointsBreakdownCategory(
    title: json['title'] ?? '',
    description: json['description'] ?? '',
    score: json['score'] ?? 0,
    maxScore: json['max_score'] ?? 0,
    percentage: (json['percentage'] ?? 0).toDouble(),
  );
}
```

### 2. Controller Fetch Example
```dart
Future<void> fetchInsights() async {
  try {
    isLoading.value = true;
    final response = await http.get(
      Uri.parse('$baseUrl/api/v1/insights'),
      headers: {'Authorization': 'Bearer $token'},
    );
    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      final data = json['data'];
      
      healthScore.value = FinancialHealthData.fromJson(data['financial_health']);
      quickMetrics.value = QuickMetricStats.fromJson(data['quick_metric_stats']);
      // Breakdown & smart insights list mapping
    }
  } finally {
    isLoading.value = false;
  }
}
```
