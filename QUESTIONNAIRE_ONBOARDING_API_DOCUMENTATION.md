# Onboarding / Questionnaire (Financial Profile) API Documentation

## Overview
This API is used during the user **Onboarding flow** to collect questionnaire answers regarding their financial profile (Monthly Salary, Other Income, Subscriptions, Fixed Costs, Monthly Savings Target, and Savings Goal).

---

## 1. Submit / Update Onboarding Questionnaire (Financial Profile)

- **Route:** `/api/v1/financial-profile` *(Also accessible via `/api/v1/onboarding`)*
- **HTTP Method:** `POST`
- **Access / Permission:** Private (Requires authenticated user Token)
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer <TOKEN>`

---

### Request Body

```json
{
  "monthlySalary": 5000,
  "otherIncome": 1200,
  "subscriptions": [
    "Netflix",
    "Spotify",
    "Gym"
  ],
  "fixedCosts": [
    {
      "category": "Rent",
      "amount": 1500
    },
    {
      "category": "Utilities",
      "amount": 250
    },
    {
      "category": "Groceries",
      "amount": 600
    }
  ],
  "monthlySavings": 1000,
  "savingsGoal": "Buy a new electric car in 2 years"
}
```

### Field Descriptions & Types

| Field | Type | Required | Description |
|---|---|---|---|
| `monthlySalary` | `number` | **Yes** | User's primary monthly salary / wage. |
| `otherIncome` | `number` | No (default: 0) | Any side income, freelance, investments, etc. |
| `subscriptions` | `Array<string>` | No (default: []) | List of active subscription services/names. |
| `fixedCosts` | `Array<FixedCost>` | No (default: []) | Array of fixed monthly expenses. |
| `fixedCosts[].category` | `string` | **Yes** (if fixedCost item provided) | Name/category of the cost (e.g. Rent, Bills, Insurance). |
| `fixedCosts[].amount` | `number` | **Yes** (if fixedCost item provided) | Cost amount. |
| `monthlySavings` | `number` | **Yes** | Target amount the user plans to save each month. |
| `savingsGoal` | `string` | **Yes** | Description/name of the savings target/goal. |

---

### Responses

#### 1. Success Response (200 OK)

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Financial onboarding profile saved successfully",
  "data": {
    "_id": "664b5c7d8e9f1a2b3c4d5e6f",
    "user": {
      "_id": "664b5c7d8e9f1a2b3c4d5e60",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+1234567890",
      "country": "United States",
      "currency": "USD",
      "role": "user",
      "status": "active"
    },
    "monthlySalary": 5000,
    "otherIncome": 1200,
    "subscriptions": [
      "Netflix",
      "Spotify",
      "Gym"
    ],
    "fixedCosts": [
      {
        "category": "Rent",
        "amount": 1500,
        "_id": "664b5c7d8e9f1a2b3c4d5e70"
      },
      {
        "category": "Utilities",
        "amount": 250,
        "_id": "664b5c7d8e9f1a2b3c4d5e71"
      },
      {
        "category": "Groceries",
        "amount": 600,
        "_id": "664b5c7d8e9f1a2b3c4d5e72"
      }
    ],
    "monthlySavings": 1000,
    "savingsGoal": "Buy a new electric car in 2 years",
    "createdAt": "2026-09-02T09:30:00.000Z",
    "updatedAt": "2026-09-02T09:30:00.000Z"
  }
}
```

---

#### 2. Unauthorized Error (401 Unauthorized)
Returned if `Bearer <TOKEN>` is missing or invalid:
```json
{
  "statusCode": 401,
  "success": false,
  "message": "You are not authorized"
}
```

#### 3. Validation Error (400 Bad Request)
Returned if mandatory questionnaire answers are missing or in wrong types:
```json
{
  "success": false,
  "message": "Validation Error",
  "errorMessages": [
    {
      "path": "monthlySalary",
      "message": "Monthly salary must be a number"
    },
    {
      "path": "monthlySavings",
      "message": "Monthly savings must be a number"
    },
    {
      "path": "savingsGoal",
      "message": "Savings goal is required"
    }
  ]
}
```

---

## 2. Get My Financial Profile / Onboarding Data

- **Route:** `/api/v1/financial-profile/me`
- **HTTP Method:** `GET`
- **Access / Permission:** Private (Requires authenticated user Token)
- **Headers:** 
  - `Authorization: Bearer <TOKEN>`

### Success Response (200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Financial profile retrieved successfully",
  "data": {
    "_id": "664b5c7d8e9f1a2b3c4d5e6f",
    "user": {
      "_id": "664b5c7d8e9f1a2b3c4d5e60",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "country": "United States",
      "currency": "USD"
    },
    "monthlySalary": 5000,
    "otherIncome": 1200,
    "subscriptions": ["Netflix", "Spotify", "Gym"],
    "fixedCosts": [
      {
        "category": "Rent",
        "amount": 1500
      }
    ],
    "monthlySavings": 1000,
    "savingsGoal": "Buy a new electric car in 2 years"
  }
}
```

---

## Flutter / Mobile App Integration Example

```dart
// Example using http / dio in Flutter
final token = 'YOUR_SAVED_JWT_TOKEN';

final response = await http.post(
  Uri.parse('${AppConstants.baseUrl}/api/v1/financial-profile'),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  },
  body: jsonEncode({
    'monthlySalary': 5000,
    'otherIncome': 500,
    'subscriptions': ['Netflix', 'Spotify'],
    'fixedCosts': [
      {'category': 'Rent', 'amount': 1200},
      {'category': 'Bills', 'amount': 200},
    ],
    'monthlySavings': 800,
    'savingsGoal': 'Emergency Fund',
  }),
);
```
