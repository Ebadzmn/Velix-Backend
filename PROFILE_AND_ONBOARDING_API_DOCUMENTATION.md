# User Profile & Onboarding Flow API Documentation

## Overview
এই সিস্টেমে ইউজারের প্রোফাইল ডাটা দেখা, আপডেট করা এবং **Sign Up বা Login এর পর ইউজার Onboarding / Questionnaire সম্পূর্ণ করেছে কিনা (`isFinancialProfileCompleted`)** তা ট্র্যাক করার পূর্ণাঙ্গ API দেওয়া হলো।

---

## 🔑 Logic & Flow কীভাবে কাজ করবে?

1. **Sign Up / Login Response:**
   - যখন ইউজার Sign Up বা Login করবে, তখন `user` অবজেক্টে `isFinancialProfileCompleted: false` বা `true` দেখতে পাবেন।
2. **Login / App Launch Decision:**
   - যদি `isFinancialProfileCompleted === false` হয়:
     👉 ইউজারকে সরাসরি **Questionnaire / Onboarding Page**-এ রিডাইরেক্ট করবেন।
   - যদি `isFinancialProfileCompleted === true` হয়:
     👉 ইউজারকে সরাসরি **Home / Dashboard**-এ রিডাইরেক্ট করবেন।
3. **Questionnaire Submission (`POST /api/v1/financial-profile`):**
   - প্রশ্নগুলোর উত্তর সাবমিট করা মাত্রই ব্যাকএন্ড অটোমেটিকালি ইউজারের `isFinancialProfileCompleted: true` করে দিবে।

---

## 1. Get My Profile (নিজের সম্পূর্ণ প্রোফাইল তথ্য)

লগইন করা ইউজারের বিস্তারিত প্রোফাইল (Status, Onboarding Flag, Name, Email ইত্যাদি) পাওয়ার জন্য।

- **Route:** `/api/v1/profile/me`
- **HTTP Method:** `GET`
- **Access:** Private (Bearer Token Required)
- **Headers:** 
  - `Authorization: Bearer <TOKEN>`

### Success Response (200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
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
```

> 💡 **নোট:** `isFinancialProfileCompleted` ফিল্ডটি চেক করে আপনি নির্ধারণ করতে পারবেন ইউজার questionnaire কমপ্লিট করেছে কিনা।

---

## 2. Update Profile (প্রোফাইল আপডেট)

ইউজারের প্রোফাইলের নাম, ফোন নম্বর, দেশ, কারেন্সি বা প্রোফাইল ইমেজ আপডেট করতে।

- **Route:** `/api/v1/profile/me`
- **HTTP Method:** `PATCH`
- **Access:** Private (Bearer Token Required)
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer <TOKEN>`

### Request Body:
```json
{
  "firstName": "Abbe",
  "lastName": "Hussain",
  "phoneNumber": "+1987654321",
  "country": "Canada",
  "currency": "CAD",
  "profileImage": "https://example.com/new-avatar.jpg"
}
```

### Success Response (200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "65e0a1b2c3d4e5f6a7b8c9d0",
    "firstName": "Abbe",
    "lastName": "Hussain",
    "email": "user@example.com",
    "phoneNumber": "+1987654321",
    "country": "Canada",
    "currency": "CAD",
    "role": "user",
    "status": "active",
    "isFinancialProfileCompleted": false,
    "profileImage": "https://example.com/new-avatar.jpg"
  }
}
```

---

## 3. Profile Dashboard Overview (ফিন্যান্সিয়াল ড্যাশবোর্ড ডাটা)

প্রোফাইল পেইজের জন্য সামগ্রিক ড্যাশবোর্ড ওভারভিউ (ইনকাম, সেভিংস, স্ট্রিক, এচিভমেন্টস)।

- **Route:** `/api/v1/profile/dashboard`
- **HTTP Method:** `GET`
- **Access:** Private (Bearer Token Required)
- **Headers:** 
  - `Authorization: Bearer <TOKEN>`

### Success Response (200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Profile dashboard fetched successfully",
  "data": {
    "user": {
      "id": "65e0a1b2c3d4e5f6a7b8c9d0",
      "name": "Abbe Hussain",
      "title": "Savings Starter"
    },
    "financial_summary": {
      "period": "September 2026",
      "currency": "USD",
      "income_per_month": 5000,
      "left_amount": 1650,
      "subscription_total": 45
    },
    "achievements_summary": {
      "current_streak_days": 5,
      "financial_health_score": 78,
      "unlocked_count": 3,
      "locked_count": 7
    },
    "achievements": {
      "unlocked": [],
      "locked": []
    }
  }
}
```

---

## 📱 Flutter Implementation Example

```dart
// Login অথবা Profile ফেচ করার পর Navigation লজিক:
void handleUserNavigation(Map<String, dynamic> userData) {
  final bool isQuestionnaireCompleted = userData['isFinancialProfileCompleted'] ?? false;

  if (!isQuestionnaireCompleted) {
    // প্রশ্নগুলোর উত্তর দেওয়া না থাকলে Questionnaire পেজে নিয়ে যাবে
    Get.offAllNamed('/questionnaire');
  } else {
    // উত্তর দেওয়া থাকলে ড্যাশবোর্ড / হোম পেজে নিয়ে যাবে
    Get.offAllNamed('/home');
  }
}
```
