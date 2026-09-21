# Login API Documentation

## Overview
This API endpoint authenticates existing users using their email and password, generates a JWT Access Token, sets an HTTP-only Refresh Token cookie, and returns user details including their onboarding questionnaire completion status (`isFinancialProfileCompleted`).

---

## Endpoint Details

- **Route:** `/api/v1/auth/login`
- **HTTP Method:** `POST`
- **Access / Permission:** Public (No authorization token needed)
- **Headers:** `Content-Type: application/json`

---

## Request Body

### JSON Payload
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

### Field Descriptions & Validation Rules

| Field | Type | Required | Description / Rules |
|---|---|---|---|
| `email` | `string` | **Yes** | Valid registered email address. |
| `password` | `string` | **Yes** | User's account password. |

---

## Responses

### 1. Success Response (200 OK)

Returned when email and password match.

```json
{
  "statusCode": 200,
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWUwYTFiMmMzZDRlNWY2YTdiOGM5ZDAiLCJyb2xlIjoidXNlciIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTcyNTI2Nzg0MCwiZXhwIjoxNzI1MzU0MjQwfQ.sample_signature",
    "user": {
      "_id": "65e0a1b2c3d4e5f6a7b8c9d0",
      "firstName": "Abbe",
      "lastName": "Hussain",
      "name": "Abbe Hussain",
      "email": "user@example.com",
      "phoneNumber": "+1234567890",
      "country": "United States",
      "currency": "USD",
      "role": "user",
      "status": "active",
      "isFinancialProfileCompleted": false,
      "profileImage": "https://example.com/avatar.jpg",
      "createdAt": "2026-09-02T09:00:00.000Z",
      "updatedAt": "2026-09-02T09:00:00.000Z"
    }
  }
}
```

> 📌 **Important for App Routing:**
> - Look at `data.user.isFinancialProfileCompleted`:
>   - If `false` ➔ Navigate user to the **Questionnaire / Onboarding Page**.
>   - If `true` ➔ Navigate user to the **Home / Dashboard**.

---

### 2. Error Responses

#### A. User Not Found (404 Not Found)
When the provided email does not exist in the database:
```json
{
  "success": false,
  "message": "User does not exist",
  "errorMessages": [
    {
      "path": "",
      "message": "User does not exist"
    }
  ]
}
```

#### B. Incorrect Password (400 Bad Request)
When the password does not match:
```json
{
  "success": false,
  "message": "Password does not match",
  "errorMessages": [
    {
      "path": "",
      "message": "Password does not match"
    }
  ]
}
```

#### C. User Blocked (403 Forbidden)
When the account status is `blocked`:
```json
{
  "success": false,
  "message": "User is blocked",
  "errorMessages": [
    {
      "path": "",
      "message": "User is blocked"
    }
  ]
}
```

#### D. Validation Error (400 Bad Request)
When email is invalid format or fields are missing:
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
      "message": "Password is required"
    }
  ]
}
```

---

## 📱 Flutter / Dart Integration Example

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:get/get.dart';

Future<void> loginUser(String email, String password) async {
  final url = Uri.parse('${AppConstants.baseUrl}/api/v1/auth/login');

  final response = await http.post(
    url,
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'email': email.trim(),
      'password': password,
    }),
  );

  final resData = jsonDecode(response.body);

  if (response.statusCode == 200 && resData['success'] == true) {
    final token = resData['data']['accessToken'];
    final user = resData['data']['user'];
    
    // 1. Save Token to local storage
    // await storage.write('token', token);

    // 2. Check questionnaire status
    final bool isCompleted = user['isFinancialProfileCompleted'] ?? false;

    if (!isCompleted) {
      Get.offAllNamed('/questionnaire');
    } else {
      Get.offAllNamed('/home');
    }
  } else {
    // Show error message
    Get.snackbar('Login Failed', resData['message'] ?? 'Something went wrong');
  }
}
```
