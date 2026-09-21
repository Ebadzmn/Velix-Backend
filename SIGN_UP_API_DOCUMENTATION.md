# Sign Up / User Registration API Documentation

## Overview
This API endpoint registers a new user in the system and automatically generates a JWT authentication token so the user is immediately authenticated.

---

## Endpoint Details

- **Route:** `/api/v1/users`
- **HTTP Method:** `POST`
- **Access / Permission:** Public (No authorization required)
- **Content-Type:** `application/json`

---

## Request Headers

| Header | Value | Required |
|---|---|---|
| `Content-Type` | `application/json` | Yes |

---

## Request Body

### JSON Schema & Payload

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "phoneNumber": "+1234567890",
  "country": "United States",
  "currency": "USD",
  "role": "user",
  "profileImage": "https://example.com/avatar.jpg"
}
```

### Field Descriptions & Validation Rules

| Field | Type | Required | Description / Validation |
|---|---|---|---|
| `firstName` | `string` | **Yes** | User's first name. |
| `lastName` | `string` | **Yes** | User's last name. |
| `email` | `string` | **Yes** | Must be a valid email address. Must be unique. |
| `password` | `string` | **Yes** | Password for the account. **Minimum length: 6 characters**. |
| `phoneNumber` | `string` | No | Contact phone number. |
| `country` | `string` | No | User's country of residence. |
| `currency` | `string` | No | Preferred currency code (e.g. `USD`, `EUR`). |
| `role` | `string` | No | Role enum (`user`, `admin`, `super_admin`). Defaults to `user`. |
| `profileImage`| `string` | No | URL or path to user's profile image. |

---

## Responses

### 1. Success Response (201 Created)

Returned when the user account is created successfully along with an access token.

```json
{
  "statusCode": 201,
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "65e0a1b2c3d4e5f6a7b8c9d0",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+1234567890",
      "country": "United States",
      "currency": "USD",
      "role": "user",
      "status": "active",
      "createdAt": "2026-09-02T09:00:00.000Z",
      "updatedAt": "2026-09-02T09:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWUwYTFiMmMzZDRlNWY2YTdiOGM5ZDAiLCJyb2xlIjoidXNlciIsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJpYXQiOjE3MjUyNjc4NDAsImV4cCI6MTcyNTM1NDI0MH0.sample_signature"
  }
}
```

---

### 2. Error Responses

#### A. Email Already Exists (400 Bad Request)
```json
{
  "success": false,
  "message": "User already exists with this email",
  "errorMessages": [
    {
      "path": "",
      "message": "User already exists with this email"
    }
  ]
}
```

#### B. Validation Error (400 Bad Request)
When required fields are missing or invalid:
```json
{
  "success": false,
  "message": "Validation Error",
  "errorMessages": [
    {
      "path": "email",
      "message": "Invalid email address"
    },
    {
      "path": "password",
      "message": "Password must be at least 6 characters long"
    }
  ]
}
```

---

## Client-Side Integration Notes

1. **Authentication Token:** Save the `data.token` received in the response into local storage, secure cookies, or your state management store.
2. **Subsequent API Calls:** Include this token in the header of protected requests:
   ```http
   Authorization: Bearer <token>
   ```
