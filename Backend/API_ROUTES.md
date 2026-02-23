# API Routes Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require one of:
1. **Authorization Header**: `Authorization: Bearer <jwt-token>`
2. **Cookie**: `token=<jwt-token>`

Responses include:
```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "token": "..." // only on login
}
```

---

## Auth Routes

### Register User
**POST** `/auth/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "success": true,
  "userId": "507f1f77bcf86cd799439011"
}
```

---

### Login User
**POST** `/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "profileImage": "https://..."
  }
}
```

---

### Logout
**POST** `/auth/logout`

**Response (200):**
```json
{
  "message": "Logout successful",
  "success": true
}
```

---

## User Routes

### Get Current User
**GET** `/user/me`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "profileImage": "https://...",
    "qrCode": "https://...",
    "phone": "+1234567890"
  }
}
```

---

### Update User Profile
**PUT** `/user/update`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "John Updated",
  "phone": "+9876543210"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated",
  "data": { ... }
}
```

---

### Search Users
**GET** `/user/search?query=john`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f...",
      "name": "John Doe",
      "email": "john@example.com",
      "profileImage": "https://..."
    }
  ]
}
```

---

### Upload Profile Image
**POST** `/user/upload-profile`

**Headers:** `Authorization: Bearer <token>`

**Body:** Form Data with `file` field (image)

**Response (200):**
```json
{
  "success": true,
  "message": "Image uploaded",
  "data": { ... }
}
```

---

### Upload QR Code
**POST** `/user/upload-qr`

**Headers:** `Authorization: Bearer <token>`

**Body:** Form Data with `file` field (image)

**Response (200):**
```json
{
  "success": true,
  "message": "QR Code uploaded",
  "data": { ... }
}
```

---

### Delete Account
**DELETE** `/user/delete-account`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

## Trip Routes

### Create Trip
**POST** `/trips/create`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Paris Vacation",
  "destination": "Paris, France",
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-06-10T00:00:00Z",
  "members": [
    { "email": "friend@example.com" },
    { "email": "another@example.com" }
  ]
}
```

**Response (201):**
```json
{
  "message": "Trip created successfully",
  "success": true,
  "tripId": "507f1f77bcf86cd799439012"
}
```

---

### Get User's Trips
**GET** `/trips/user`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f...",
      "name": "Paris Vacation",
      "destination": "Paris, France",
      "startDate": "2024-06-01T00:00:00Z",
      "endDate": "2024-06-10T00:00:00Z",
      "status": "active",
      "totalExpense": 15000,
      "yourBalance": 2500,
      "userStatus": "joined",
      "isAdmin": true,
      "membersCount": 3
    }
  ]
}
```

---

### Get Trip Details
**GET** `/trips/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "trip": { ... },
    "expenses": [ ... ],
    "totalTripExpense": 15000,
    "membersWithBalances": [
      {
        "userId": "507f...",
        "name": "John Doe",
        "email": "john@example.com",
        "profileImage": "https://...",
        "totalPaid": 5000,
        "totalShare": 2500,
        "balance": 2500
      }
    ]
  }
}
```

---

### Add Member to Trip
**POST** `/trips/:id/add-member`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "email": "newmember@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Member invited successfully",
  "data": { ... }
}
```

---

### Respond to Invitation
**POST** `/trips/:id/respond`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "action": "accept" // or "reject"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Invitation accepted"
}
```

---

### End Trip
**POST** `/trips/:id/end`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Trip ended successfully",
  "data": { ... }
}
```

---

## Expense Routes

### Add Expense
**POST** `/expenses/add`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "tripId": "507f1f77bcf86cd799439012",
  "title": "Dinner",
  "amount": 2500,
  "category": "food",
  "paidBy": "507f1f77bcf86cd799439011",
  "splitBetween": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439013"
  ],
  "splitType": "equally",
  "splitAmounts": {}
}
```

**Response (201):**
```json
{
  "message": "Expense added successfully",
  "success": true,
  "data": { ... }
}
```

---

### Update Expense
**PUT** `/expenses/:id`

**Headers:** `Authorization: Bearer <token>`

**Body:** Same as add expense

**Response (200):**
```json
{
  "message": "Expense updated successfully",
  "success": true,
  "data": { ... }
}
```

---

### Delete Expense
**DELETE** `/expenses/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

---

## Settlement Routes

### Get Settlements
**GET** `/trips/:id/settlements`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "from": {
        "id": "507f...",
        "name": "John Doe",
        "avatar": "https://...",
        "email": "john@example.com"
      },
      "to": {
        "id": "507f...",
        "name": "Jane Doe",
        "avatar": "https://...",
        "email": "jane@example.com"
      },
      "amount": 1250
    }
  ]
}
```

---

## Analytics Routes

### Get Analytics
**GET** `/trips/:id/analytics`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalSpent": 15000,
    "pieData": [
      { "name": "Food", "value": 8000 },
      { "name": "Hotel", "value": 5000 },
      { "name": "Transport", "value": 2000 }
    ],
    "barData": [
      { "name": "John", "amount": 5000 },
      { "name": "Jane", "amount": 10000 }
    ]
  }
}
```

---

## Itinerary Routes

### Get Itinerary
**GET** `/trips/:id/itinerary`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f...",
      "trip": "507f...",
      "title": "Visit Eiffel Tower",
      "date": "2024-06-05T00:00:00Z",
      "time": "10:00 AM",
      "location": "Eiffel Tower, Paris",
      "notes": "Meet at entrance",
      "createdBy": "507f..."
    }
  ]
}
```

---

### Add Activity
**POST** `/trips/:id/itinerary`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "title": "Visit Eiffel Tower",
  "date": "2024-06-05T00:00:00Z",
  "time": "10:00 AM",
  "location": "Eiffel Tower, Paris",
  "notes": "Meet at entrance"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

## Packing List Routes

### Get Packing List
**GET** `/trips/:id/packing`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f...",
      "trip": "507f...",
      "text": "Passport",
      "category": "Documents",
      "isChecked": true,
      "addedBy": "507f...",
      "createdAt": "2024-05-20T00:00:00Z"
    }
  ]
}
```

---

### Add Packing Item
**POST** `/trips/:id/packing`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "text": "Passport",
  "category": "Documents"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### Toggle Packing Item
**PUT** `/trips/:id/packing`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "itemId": "507f...",
  "isChecked": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### Delete Packing Item
**DELETE** `/trips/:id/packing?itemId=507f...`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Item deleted"
}
```

---

## Chat Routes

### Get Messages
**GET** `/trips/:id/chat`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f...",
      "trip": "507f...",
      "sender": {
        "_id": "507f...",
        "name": "John",
        "profileImage": "https://..."
      },
      "content": "Let's meet at noon!",
      "createdAt": "2024-05-20T10:30:00Z"
    }
  ]
}
```

---

### Send Message
**POST** `/trips/:id/chat`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "content": "Let's meet at noon!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

## Notification Routes

### Get Notifications
**GET** `/notifications`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f...",
      "recipient": "507f...",
      "sender": {
        "_id": "507f...",
        "name": "John",
        "profileImage": "https://..."
      },
      "trip": {
        "_id": "507f...",
        "name": "Paris Vacation"
      },
      "message": "Invited you to join \"Paris Vacation\"",
      "type": "invite",
      "isRead": false,
      "createdAt": "2024-05-20T10:00:00Z"
    }
  ]
}
```

---

### Mark All as Read
**PUT** `/notifications`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "All marked as read"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Please fill in all required fields"
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication token missing"
}
```

### 403 Forbidden
```json
{
  "message": "Only the admin can add members"
}
```

### 404 Not Found
```json
{
  "message": "Trip not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Amounts are in minor currency units (e.g., paise for INR)
- Token expires in 7 days
- All endpoints support JSON content type
- File uploads limited to 5MB
