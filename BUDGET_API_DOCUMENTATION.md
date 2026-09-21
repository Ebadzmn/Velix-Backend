# Budget Dashboard API Documentation

## 1. Budget Dashboard Overview
- **Endpoint**: `GET /api/v1/budget/dashboard`
- **Description**: Returns the comprehensive budget dashboard summary, active savings goal progress, and breakdowns for fixed expenses and monthly variable costs by category.
- **Authentication**: `Bearer <JWT_TOKEN>` (Protected route)
- **Roles Allowed**: `user`, `admin`, `super_admin`

---

## 2. Request Details

### Headers
| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | `string` | **Yes** | `Bearer <JWT_ACCESS_TOKEN>` |
| `Content-Type` | `string` | No | `application/json` |

### Query Parameters
| Parameter | Type | Required | Default | Description | Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `month` | `string` | No | Current month | Filter data for a specific year and month (`YYYY-MM`) | `?month=2026-09` |

---

## 3. Backend Calculation Logic

1. **`income`**:
   - `FinancialProfile.monthlySalary + FinancialProfile.otherIncome`
   - If not set in `FinancialProfile`, falls back to total income logged in the `Income` collection for the target month.
2. **`fixed_expenses`**:
   - Sum of all amounts in `FinancialProfile.fixedCosts`.
   - If profile is empty, falls back to `FixedExpense` entries (monthly or yearly / 12).
3. **`subscriptions`**:
   - Sum of all user active subscriptions calculated on a monthly basis:
     - If `billing_period === 'yearly'`, cost is `price / 12`
     - If `billing_period === 'monthly'`, cost is `price`
4. **`variable_costs`**:
   - Sum of variable cost transactions recorded in the `Cost` collection for the selected calendar month.
5. **`total_expenses`**:
   - `fixed_expenses + subscriptions + variable_costs`
6. **`money_left`**:
   - `Math.max(0, income - total_expenses)`
7. **`days_left`**:
   - Days remaining in the current month (inclusive of today: `totalDaysInMonth - currentDayOfMonth + 1`).
   - If month is in future: total days in that month.
   - If month is in past: `0`.
8. **`safe_to_spend_today`**:
   - `days_left > 0 ? Math.round(money_left / days_left) : 0`
9. **`is_overspent`**:
   - `total_expenses > income` (`true` / `false`)
10. **`overspent_amount`**:
    - `is_overspent ? (total_expenses - income) : 0`
11. **`currency`**:
    - User's preferred currency (defaults to `"SEK"`).

---

## 4. Response Format

### Successful Response (`200 OK`)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Budget dashboard retrieved successfully",
  "data": {
    "summary": {
      "income": 25000,
      "fixed_expenses": 8500,
      "subscriptions": 450,
      "variable_costs": 3200,
      "total_expenses": 12150,
      "money_left": 12850,
      "safe_to_spend_today": 428,
      "days_left": 30,
      "is_overspent": false,
      "overspent_amount": 0,
      "currency": "SEK"
    },
    "savings_goal": {
      "title": "Holiday",
      "target_amount": 10000,
      "saved_amount": 2500,
      "monthly_savings_target": 1000,
      "progress_percentage": 25.0
    },
    "breakdown": {
      "fixed_costs": [
        { "category": "Rent/Mortgage", "amount": 6000 },
        { "category": "Utilities", "amount": 1500 },
        { "category": "Insurance", "amount": 1000 }
      ],
      "variable_costs_by_category": [
        { "category": "Food & Dining", "amount": 1800 },
        { "category": "Shopping", "amount": 900 },
        { "category": "Transportation", "amount": 500 }
      ]
    }
  }
}
```

---

## 5. Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "success": false,
  "message": "You are not authorized"
}
```
