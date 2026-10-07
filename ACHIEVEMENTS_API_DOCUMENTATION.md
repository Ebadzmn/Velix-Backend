# Achievements & Streaks API Documentation

## 1. Overview
The **Achievements** screen displays:
1. **Streak Progress Banner (Top Card)**: Current consecutive days streak (e.g. `🔥 1 day streak`), encouragement text, and active days pill.
2. **Financial Health Progress Banner (Second Card)**: Financial health percentage (0 - 100%) with a visual progress bar.
3. **Unlocked Achievements (`UNLOCKED · count`)**: Badges the user has successfully achieved (with check icon, bright emoji background, title & description).
4. **Locked Achievements (`LOCKED · count`)**: Badges yet to be unlocked (with lock icon, dimmed background, requirement description, and progress object `{ current, target, percentage }`).

---

## 2. API Endpoints

### 2.1 Get Achievements Dashboard
- **Route**: `GET /api/v1/achievements`
- **Alternative Route**: `GET /api/v1/profile/achievements`
- **Auth Required**: `Bearer <JWT_TOKEN>`
- **Description**: Returns streak summary, financial health score, summary stats, and partitioned lists of unlocked and locked achievements.

#### Request Headers:
```http
Authorization: Bearer <token>
Content-Type: application/json
```

#### Successful Response (200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Achievements retrieved successfully",
  "data": {
    "streak": {
      "current_streak_days": 3,
      "longest_streak_days": 7,
      "last_activity_date": "2026-09-26T10:00:00.000Z",
      "streak_title": "3 day streak",
      "streak_message": "Open the app every day to build your streak"
    },
    "financial_health": {
      "score": 78,
      "max_score": 100,
      "percentage": 78.0
    },
    "summary": {
      "total_achievements": 7,
      "unlocked_count": 2,
      "locked_count": 5,
      "progress_percentage": 28.6
    },
    "unlocked": [
      {
        "id": "first_step",
        "title": "First step",
        "description": "Completed onboarding and got started with Koll",
        "emoji": "🎯",
        "category": "onboarding",
        "unlocked_at": "2026-09-20T14:22:00.000Z",
        "is_unlocked": true
      },
      {
        "id": "savings_goal_set",
        "title": "Savings goal set",
        "description": "Created your first savings goal",
        "emoji": "💎",
        "category": "savings",
        "unlocked_at": "2026-09-22T09:15:00.000Z",
        "is_unlocked": true
      }
    ],
    "locked": [
      {
        "id": "subscription_hunter",
        "title": "Subscription hunter",
        "description": "Have 5 or more active subscriptions",
        "emoji": "🔍",
        "category": "subscriptions",
        "is_unlocked": false,
        "progress": {
          "current": 2,
          "target": 5,
          "percentage": 40.0
        }
      },
      {
        "id": "budget_master",
        "title": "Budget Master",
        "description": "Achieved financial health of 80 or more",
        "emoji": "🏆",
        "category": "health",
        "is_unlocked": false,
        "progress": {
          "current": 78,
          "target": 80,
          "percentage": 97.5
        }
      },
      {
        "id": "financial_health_90",
        "title": "Financial health 90+",
        "description": "Achieved amazing financial health",
        "emoji": "⭐",
        "category": "health",
        "is_unlocked": false,
        "progress": {
          "current": 78,
          "target": 90,
          "percentage": 86.7
        }
      },
      {
        "id": "streak_30_days",
        "title": "30 day streak",
        "description": "Opened the app 30 days in a row",
        "emoji": "🔥",
        "category": "streak",
        "is_unlocked": false,
        "progress": {
          "current": 3,
          "target": 30,
          "percentage": 10.0
        }
      },
      {
        "id": "savings_hero",
        "title": "Savings hero",
        "description": "Reached 50% of a savings goal",
        "emoji": "💰",
        "category": "savings",
        "is_unlocked": false,
        "progress": {
          "current": 0,
          "target": 50,
          "percentage": 0.0
        }
      }
    ]
  }
}
```

---

### 2.2 Record Daily Activity / Heartbeat (Streak Keeper)
- **Route**: `POST /api/v1/achievements/streak/heartbeat`
- **Auth Required**: `Bearer <JWT_TOKEN>`
- **Description**: Updates consecutive streak days.

#### Successful Response (200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Streak updated successfully",
  "data": {
    "current_streak_days": 4,
    "is_new_milestone": false
  }
}
```

---

## 3. Achievement Badges & Auto-Evaluation Rules

| Achievement ID | Title | Emoji | Trigger / Condition |
| :--- | :--- | :---: | :--- |
| `first_step` | First step | 🎯 | User has completed onboarding or added income (`hasFirstStep: true`). |
| `savings_goal_set` | Savings goal set | 💎 | User has created at least 1 savings goal (`savings_goals.length > 0`). |
| `subscription_hunter` | Subscription hunter | 🔍 | Active subscriptions count $\ge 5$. |
| `budget_master` | Budget Master | 🏆 | Economic health score $\ge 80$. |
| `financial_health_90`| Financial health 90+ | ⭐ | Economic health score $\ge 90$. |
| `streak_30_days` | 30 day streak | 🔥 | `current_streak_days >= 30`. |
| `savings_hero` | Savings hero | 💰 | User saved at least 50% of any savings goal. |
