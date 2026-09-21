# Variable Cost API Specification

## Base URL
```text
http://<SERVER_IP>:5000/api/v1
```
- **Authentication:** `Bearer <accessToken>` (All routes require auth)
- **Headers:** `Content-Type: application/json`

---

## 🏷️ 1. Supported Categories & Allowed Values

| Category Key | UI Label | বিবরণ |
|---|---|---|
| `Food` | Food | মুদি ও খাবারের খরচ (যেমন: ICA) |
| `Takeaway` | Takeaway | রেস্টুরেন্ট/ক্যাফে (যেমন: Espresso House) |
| `Shopping` | Shopping | কেনাকাটা |
| `Transport` | Transport | যাতায়াত (যেমন: SL Transport) |
| `The fun` | The fun | বিনোদন/ঘোরাঘুরি |
| `Health` | Health | স্বাস্থ্য ও ওষুধ |
| `Household` | Household | ঘরের দরকারি খরচ |
| `Swish` | Swish | বন্ধু বা কাউকে পাঠানো টাকা |
| `Other` | Other | অন্যান্য খরচ (Default) |

---

## 📌 2. Add / Create Variable Cost (খরচ যোগ করা)

- **Route:** `POST /api/v1/variable-costs` *(অথবা `POST /api/v1/costs`)*
- **Auth:** Bearer Token
- **Headers:**
  ```http
  Authorization: Bearer <accessToken>
  Content-Type: application/json
  ```

### 📤 Request Body:
```json
{
  "title": "ICA Supermarket",
  "amount": 350.0,
  "category": "Food",
  "date": "2026-09-20",
  "note": "Weekly groceries",
  "currency": "SEK"
}
```

### 📋 ফিল্ডের বিবরণ:
| Field | Type | Required | Default | বিবরণ |
|---|---|:---:|---|---|
| `title` | `string` | **Yes** | - | কী কেনা হয়েছে (যেমন: `"ICA"`, `"Espresso House"`) |
| `amount` | `number` | **Yes** | - | খরচের পরিমাণ (যেমন: `350.0`, অবশ্যই পজিটিভ সংখ্যা) |
| `category` | `string` | **No** | `"Other"` | ক্যাটাগরি (উপরের লিস্ট থেকে) |
| `date` | `string` (ISO/Date) | **No** | Current Date | খরচের তারিখ (`YYYY-MM-DD` বা ISO স্ট্রিং) |
| `note` | `string` | **No** | `""` | ঐচ্ছিক নোট |
| `currency` | `string` | **No** | `"SEK"` | কারেন্সি কোড (`"SEK"`, `"USD"`, `"EUR"`) |

---

### 📥 Responses:

#### ✅ 201 Created (সফলভাবে যুক্ত হলে):
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Variable cost added successfully",
  "data": {
    "id": "66ee9f1a2bc4119d8858a101",
    "user": "65e0a1b2c3d4e5f6a7b8c9d0",
    "title": "ICA Supermarket",
    "amount": 350.0,
    "category": "Food",
    "date": "2026-09-20T00:00:00.000Z",
    "note": "Weekly groceries",
    "currency": "SEK",
    "createdAt": "2026-09-20T16:20:00.000Z",
    "updatedAt": "2026-09-20T16:20:00.000Z"
  }
}
```

#### ❌ 400 Bad Request (ভ্যালিডেশন ভুল হলে):
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Validation Error",
  "errorMessages": [
    {
      "path": "title",
      "message": "Title is required"
    },
    {
      "path": "amount",
      "message": "Amount must be a positive number"
    }
  ]
}
```

---

## 📌 3. Variable Cost Dashboard & List (ফিল্টারসহ তালিকা ও সামারি)

- **Route:** `GET /api/v1/variable-costs/dashboard` *(অথবা `GET /api/v1/costs/dashboard`)*
- **Auth:** Bearer Token

### Query Parameters:
- `filter` *(optional)*: `this_month` (default) | `last_month` | `last_3_months` | `all`
- `category` *(optional)*: নির্দিষ্ট ক্যাটাগরি ফিল্টার করার জন্য (যেমন: `Food`)
- `page` *(optional)*: 1
- `limit` *(optional)*: 50

### 🌐 Example Request:
```http
GET /api/v1/variable-costs/dashboard?filter=this_month
Authorization: Bearer <accessToken>
```

### 📥 Response (✅ 200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Variable costs dashboard fetched successfully",
  "data": {
    "summary": {
      "total_amount": 650.0,
      "total_transactions": 3,
      "currency": "SEK",
      "active_filter": "this_month"
    },
    "transactions": [
      {
        "id": "66ee9f1a2bc4119d8858a101",
        "user": "65e0a1b2c3d4e5f6a7b8c9d0",
        "title": "ICA Supermarket",
        "amount": 350.0,
        "category": "Food",
        "date": "2026-09-20T00:00:00.000Z",
        "note": "Weekly groceries",
        "currency": "SEK",
        "createdAt": "2026-09-20T16:20:00.000Z"
      },
      {
        "id": "66ee9f1a2bc4119d8858a102",
        "user": "65e0a1b2c3d4e5f6a7b8c9d0",
        "title": "Espresso House",
        "amount": 120.0,
        "category": "Takeaway",
        "date": "2026-09-19T00:00:00.000Z",
        "note": "Coffee & pastry",
        "currency": "SEK",
        "createdAt": "2026-09-19T14:15:00.000Z"
      },
      {
        "id": "66ee9f1a2bc4119d8858a103",
        "user": "65e0a1b2c3d4e5f6a7b8c9d0",
        "title": "SL Transport",
        "amount": 180.0,
        "category": "Transport",
        "date": "2026-09-18T00:00:00.000Z",
        "note": "Subway tickets",
        "currency": "SEK",
        "createdAt": "2026-09-18T09:30:00.000Z"
      }
    ]
  }
}
```

---

## 📌 4. Get Single Variable Cost Details (একটি খরচের বিবরণ)

- **Route:** `GET /api/v1/variable-costs/:id`
- **Auth:** Bearer Token

### 📥 Response (✅ 200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Variable cost retrieved successfully",
  "data": {
    "id": "66ee9f1a2bc4119d8858a101",
    "user": "65e0a1b2c3d4e5f6a7b8c9d0",
    "title": "ICA Supermarket",
    "amount": 350.0,
    "category": "Food",
    "date": "2026-09-20T00:00:00.000Z",
    "note": "Weekly groceries",
    "currency": "SEK",
    "createdAt": "2026-09-20T16:20:00.000Z"
  }
}
```

---

## 📌 5. Update Variable Cost (খরচ এডিট/আপডেট করা)

- **Route:** `PATCH /api/v1/variable-costs/:id` *(অথবা `PUT /api/v1/variable-costs/:id`)*
- **Auth:** Bearer Token

### 📤 Request Body:
```json
{
  "title": "ICA Supermarket - Updated",
  "amount": 390.0,
  "note": "Added extra fruits"
}
```

### 📥 Response (✅ 200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Variable cost updated successfully",
  "data": {
    "id": "66ee9f1a2bc4119d8858a101",
    "title": "ICA Supermarket - Updated",
    "amount": 390.0,
    "category": "Food",
    "date": "2026-09-20T00:00:00.000Z",
    "note": "Added extra fruits",
    "currency": "SEK"
  }
}
```

---

## 📌 6. Delete Variable Cost (খরচ মুছে ফেলা)

- **Route:** `DELETE /api/v1/variable-costs/:id`
- **Auth:** Bearer Token

### 📥 Responses:

#### ✅ 200 OK:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Variable cost deleted successfully",
  "data": null
}
```

#### ❌ 404 Not Found:
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Variable cost not found"
}
```
