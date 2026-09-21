# Subscription API Documentation

## Overview
This documentation provides details for managing user subscriptions, including creating/adding a new subscription, retrieving the subscription dashboard, listing subscriptions with pagination/filters, updating subscriptions, and deleting subscriptions.

---

## Base URL
```text
http://<SERVER_IP>:5000/api/v1/subscriptions
```

---

## 1. Add / Create Subscription

Add a new subscription for the authenticated user. The `category` is directly provided as a text string (no category ID / ObjectId required).

- **Route:** `/api/v1/subscriptions`
- **HTTP Method:** `POST`
- **Authentication:** Bearer Token (User / Admin / Super Admin)
- **Headers:**
  ```http
  Authorization: Bearer <your_jwt_access_token>
  Content-Type: application/json
  ```

### Request Body

#### JSON Payload
```json
{
  "name": "Netflix",
  "price": 149.0,
  "billing_period": "monthly",
  "currency": "SEK",
  "category": "Entertainment"
}
```

#### Field Specifications

| Field | Type | Required | Allowed Values / Description |
|---|---|:---:|---|
| `name` | `string` | **Yes** | Name of the subscription (e.g., `"Netflix"`, `"Spotify"`). |
| `price` | `number` | **Yes** | Recurring subscription price (e.g., `149.0`). |
| `billing_period` | `string` | **Yes** | `"monthly"` or `"yearly"`. |
| `currency` | `string` | **Yes** | Currency code (e.g., `"SEK"`, `"USD"`, `"EUR"`). |
| `category` | `string` | **Yes** | Category name (e.g., `"Entertainment"`, `"Music"`, `"Productivity"`). |

---

### Responses

#### Success Response (201 Created)
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Subscription added successfully",
  "data": {
    "id": "66ee891a2bc4119d8858f90a",
    "user": "65e0a1b2c3d4e5f6a7b8c9d0",
    "name": "Netflix",
    "price": 149,
    "billing_period": "monthly",
    "currency": "SEK",
    "category": "Entertainment",
    "createdAt": "2026-09-20T14:52:00.000Z",
    "updatedAt": "2026-09-20T14:52:00.000Z"
  }
}
```

#### Error Responses

##### 400 Bad Request (Validation Error)
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Validation Error",
  "errorMessages": [
    {
      "path": "name",
      "message": "Name is required"
    },
    {
      "path": "billing_period",
      "message": "Billing period must be monthly or yearly"
    }
  ]
}
```

##### 401 Unauthorized
```json
{
  "statusCode": 401,
  "success": false,
  "message": "You are not authorized"
}
```

---

## 2. Get Subscription Dashboard

Returns summary statistics (total monthly cost, total yearly cost, total count) along with all subscriptions.

- **Route:** `/api/v1/subscriptions/dashboard`
- **HTTP Method:** `GET`
- **Authentication:** Bearer Token

### Success Response (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Subscription dashboard fetched successfully",
  "data": {
    "summary": {
      "total_subscriptions": 2,
      "total_per_month": 248.0,
      "total_per_year": 2976.0,
      "currency": "SEK"
    },
    "subscriptions": [
      {
        "id": "66ee891a2bc4119d8858f90a",
        "user": "65e0a1b2c3d4e5f6a7b8c9d0",
        "name": "Netflix",
        "price": 149,
        "billing_period": "monthly",
        "currency": "SEK",
        "category": "Entertainment",
        "createdAt": "2026-09-20T14:52:00.000Z"
      },
      {
        "id": "66ee892b2bc4119d8858f90b",
        "user": "65e0a1b2c3d4e5f6a7b8c9d0",
        "name": "Spotify",
        "price": 99,
        "billing_period": "monthly",
        "currency": "SEK",
        "category": "Music",
        "createdAt": "2026-09-20T14:50:00.000Z"
      }
    ]
  }
}
```

---

## 3. Get All Subscriptions (Paginated / Filtered)

- **Route:** `/api/v1/subscriptions`
- **HTTP Method:** `GET`
- **Authentication:** Bearer Token
- **Query Parameters:**
  - `page` *(optional, default: 1)*: Page number
  - `limit` *(optional, default: 20)*: Number of items per page
  - `category` *(optional)*: Filter by category name (e.g. `?category=Entertainment`)

### Success Response (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Subscriptions retrieved successfully",
  "data": {
    "items": [
      {
        "id": "66ee891a2bc4119d8858f90a",
        "user": "65e0a1b2c3d4e5f6a7b8c9d0",
        "name": "Netflix",
        "price": 149,
        "billing_period": "monthly",
        "currency": "SEK",
        "category": "Entertainment",
        "createdAt": "2026-09-20T14:52:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 1,
      "total_pages": 1
    }
  }
}
```

---

## 4. Get Subscription By ID

- **Route:** `/api/v1/subscriptions/:id`
- **HTTP Method:** `GET`
- **Authentication:** Bearer Token

### Success Response (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Subscription fetched successfully",
  "data": {
    "id": "66ee891a2bc4119d8858f90a",
    "user": "65e0a1b2c3d4e5f6a7b8c9d0",
    "name": "Netflix",
    "price": 149,
    "billing_period": "monthly",
    "currency": "SEK",
    "category": "Entertainment",
    "createdAt": "2026-09-20T14:52:00.000Z"
  }
}
```

---

## 5. Update Subscription

- **Route:** `/api/v1/subscriptions/:id`
- **HTTP Method:** `PUT`
- **Authentication:** Bearer Token

### Request Body
```json
{
  "name": "Netflix Premium",
  "price": 179.0,
  "billing_period": "monthly",
  "currency": "SEK",
  "category": "Entertainment"
}
```

### Success Response (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Subscription updated successfully",
  "data": {
    "id": "66ee891a2bc4119d8858f90a",
    "name": "Netflix Premium",
    "price": 179,
    "billing_period": "monthly",
    "currency": "SEK",
    "category": "Entertainment"
  }
}
```

---

## 6. Delete Subscription

- **Route:** `/api/v1/subscriptions/:id`
- **HTTP Method:** `DELETE`
- **Authentication:** Bearer Token

### Success Response (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Subscription deleted successfully"
}
```
