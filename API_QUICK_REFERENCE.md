# SmartSplit API - Quick Reference Table

**Endpoint Count: 70+** | **Models: 11** | **Supported Platforms: Web & Mobile**

---

## AUTH ENDPOINTS

| Method | Endpoint | Auth | Body | Returns |
|--------|----------|------|------|---------|
| POST | `/api/auth/register` | No | `{name, email, password}` | `{success, userId}` |
| POST | `/api/auth/login` | No | `{email, password}` | `{success, token, user}` |
| POST | `/api/auth/google-login` | No | `{email, name, googleId}` | `{success, token, user}` |
| POST | `/api/auth/refresh` | No | Uses cookie | `{token, refreshToken}` |
| POST | `/api/auth/logout` | No | - | `{success}` |

---

## USER ENDPOINTS

| Method | Endpoint | Auth | Query/Body | Returns |
|--------|----------|------|-----------|---------|
| GET | `/api/user/me` | ✅ | - | `{success, data: User}` |
| PUT | `/api/user/update` | ✅ | `{name?, phone?}` | `{success, data: User}` |
| GET | `/api/user/search` | ✅ | `query=string` | `{success, data: User[]}` |
| POST | `/api/user/upload-profile` | ✅ | `file (multipart)` | `{success, data: User}` |
| POST | `/api/user/upload-qr` | ✅ | `file (multipart)` | `{success, data: User}` |
| DELETE | `/api/user/delete-account` | ✅ | - | `{success}` |

---

## PROFILE ENDPOINTS

| Method | Endpoint | Auth | Body | Returns |
|--------|----------|------|------|---------|
| GET | `/api/profile` | ✅ | - | `{success, data: User}` |
| PUT | `/api/profile` | ✅ | `{name?, phone?, email?}` | `{success, data: User}` |
| GET | `/api/profile/stats` | ✅ | - | `{success, data: {...stats}}` |
| PUT | `/api/profile/preferences` | ✅ | `{theme?, notifications?}` | `{success, data}` |
| PUT | `/api/profile/budget-goals` | ✅ | `{monthlyIncome?, budget?, savingsGoal?}` | `{success, data: User}` |
| PUT | `/api/profile/payment-preferences` | ✅ | `{upiId?, bankAccount?, autoPay?}` | `{success, data}` |
| PUT | `/api/profile/categories` | ✅ | `{expenseCategories: []}` | `{success, data: User}` |
| PUT | `/api/profile/privacy` | ✅ | `{privacyMode?, hideBalances?...}` | `{success, data}` |
| PUT | `/api/profile/security` | ✅ | `{appLockEnabled?, pinCode?}` | `{success, data}` |
| PUT | `/api/profile/change-password` | ✅ | `{currentPassword, newPassword}` | `{success}` |
| GET | `/api/profile/export` | ✅ | - | JSON file |
| POST | `/api/profile/reset-savings` | ✅ | - | `{success, data: User}` |

---

## GROUP ENDPOINTS

| Method | Endpoint | Auth | Body/Query | Returns |
|--------|----------|------|-----------|---------|
| GET | `/api/groups/health/check` | No | - | `{message, status}` |
| GET | `/api/groups/debug/all-groups` | ✅ | - | `{groups, count}` |
| POST | `/api/groups` | ✅ | `{name, type, emoji?, members?}` | `{success, data: Group}` |
| GET | `/api/groups` | ✅ | - | `{success, data: Group[]}` |
| GET | `/api/groups/:id` | ✅ | - | `{success, data: Group}` |
| GET | `/api/groups/:id/timeline` | ✅ | - | `{success, data: {...}}` |
| GET | `/api/groups/:id/summary` | ✅ | - | `{success, data: {...}}` |
| GET | `/api/groups/:id/settlements` | ✅ | - | `{success, data: {...}}` |
| PUT | `/api/groups/:id` | ✅ | Group fields | `{success, data: Group}` |
| PUT | `/api/groups/:id/settlements` | ✅ | `{fromUserId, toUserId, amount}` | `{success, data: Settlement}` |
| POST | `/api/groups/:id/members` | ✅ | `{userId or email}` | `{success, data: Group}` |
| DELETE | `/api/groups/:id/members/:memberId` | ✅ | - | `{success}` |
| POST | `/api/groups/:groupId/expenses` | ✅ | Expense data | `{success, data: Expense}` |
| DELETE | `/api/groups/:groupId/expenses/:expenseId` | ✅ | - | `{success}` |
| DELETE | `/api/groups/:id` | ✅ | - | `{success}` |

---

## EXPENSE ENDPOINTS

| Method | Endpoint | Auth | Body | Returns |
|--------|----------|------|------|---------|
| POST | `/api/expenses/add` | ✅ | `{title, amount, category, paidBy, splitBetween, splitType}` | `{success, data: Expense}` |
| GET | `/api/expenses/group/:id` | ✅ | `limit?, skip?` | `{success, data: Expense[]}` |
| GET | `/api/expenses/group/:id/balances` | ✅ | - | `{success, data: BalanceRow[]}` |
| PUT | `/api/expenses/:id` | ✅ | Expense fields | `{success, data: Expense}` |
| DELETE | `/api/expenses/:id` | ✅ | - | `{success}` |

---

## SETTLEMENT ENDPOINTS

| Method | Endpoint | Auth | Body/Query | Returns |
|--------|----------|------|-----------|---------|
| GET | `/api/settlements/user` | ✅ | - | `{success, data: Settlement[]}` |
| GET | `/api/settlements/pending` | ✅ | `status?` | `{success, data: Settlement[]}` |
| GET | `/api/settlements/history` | ✅ | `limit?, skip?, startDate?, endDate?` | `{success, data: Settlement[]}` |
| GET | `/api/settlements/group/:groupId` | ✅ | - | `{success, data: Settlement[]}` |
| POST | `/api/settlements` | ✅ | `{fromUserId, toUserId, amount, method}` | `{success, data: Settlement}` |
| POST | `/api/settlements/group/:id` | ✅ | Settlement data | `{success, data: Settlement}` |
| POST | `/api/settlements/remind` | ✅ | `{settlementId}` | `{success, remindCount}` |
| PUT | `/api/settlements/:id/partial` | ✅ | `{amountPaid}` | `{success, data: Settlement}` |
| PUT | `/api/settlements/:id/mark-received` | ✅ | - | `{success}` |

---

## FRIENDS ENDPOINTS

| Method | Endpoint | Auth | Query | Returns |
|--------|----------|------|-------|---------|
| GET | `/api/friends/balances` | ✅ | - | `{success, data: [{friendId, netBalance}]}` |
| GET | `/api/friends/:id/history` | ✅ | `limit?, skip?` | `{success, data: {...}}` |

---

## BUDGET ENDPOINTS

| Method | Endpoint | Auth | Body/Query | Returns |
|--------|----------|------|-----------|---------|
| POST | `/api/budgets` | ✅ | `{category, limit, month, year}` | `{success, data: Budget}` |
| GET | `/api/budgets/status` | ✅ | `month?, year?` | `{success, data: [{category, spent, limit}]}` |
| PUT | `/api/budgets/:id` | ✅ | `{limit}` | `{success, data: Budget}` |
| DELETE | `/api/budgets/:id` | ✅ | - | `{success}` |

---

## NOTIFICATION ENDPOINTS

| Method | Endpoint | Auth | Query | Returns |
|--------|----------|------|-------|---------|
| GET | `/api/notifications` | ✅ | `limit?, skip?, isRead?` | `{success, data: Notification[]}` |
| PUT | `/api/notifications/:id/read` | ✅ | - | `{success, data: Notification}` |
| PUT | `/api/notifications/read-all` | ✅ | - | `{success}` |
| DELETE | `/api/notifications/clear` | ✅ | - | `{success}` |

---

## ANALYTICS ENDPOINTS

| Method | Endpoint | Auth | Query | Returns |
|--------|----------|------|-------|---------|
| GET | `/api/analytics/monthly` | ✅ | - | `{success, data: [{month, personal, group}]}` |
| GET | `/api/analytics/categories` | ✅ | `month, year` | `{success, data: [{category, amount, emoji}]}` |
| GET | `/api/analytics/group-vs-personal` | ✅ | - | `{success, data: [{month, group, personal}]}` |
| GET | `/api/analytics/friend-spending` | ✅ | - | `{success, data: [{friendId, totalShared}]}` |
| GET | `/api/analytics/trip/:id` | ✅ | - | `{success, data: {...breakdown}}` |
| GET | `/api/analytics/recent-activity` | ✅ | - | `{success, data: Expense[]}` |
| GET | `/api/analytics/insights` | ✅ | - | `{success, data: {...insights}}` |
| GET | `/api/analytics/dashboard` | ✅ | - | `{success, data: {...alerts}}` |

---

## PERSONAL EXPENSE ENDPOINTS

| Method | Endpoint | Auth | Body/Query | Returns |
|--------|----------|------|-----------|---------|
| POST | `/api/personal-expenses` | ✅ | `{amount, description, category, paymentMethod, expenseDate}` | `{success, data: PersonalExpense}` |
| GET | `/api/personal-expenses` | ✅ | `limit?, skip?, category?, startDate?, endDate?` | `{success, data: PersonalExpense[]}` |
| GET | `/api/personal-expenses/summary` | ✅ | `month?, year?` | `{success, data: [{category, total}]}` |
| GET | `/api/personal-expenses/:id` | ✅ | - | `{success, data: PersonalExpense}` |
| PUT | `/api/personal-expenses/:id` | ✅ | PersonalExpense fields | `{success, data: PersonalExpense}` |
| DELETE | `/api/personal-expenses/:id` | ✅ | - | `{success}` |

---

## TRIP ENDPOINTS

| Method | Endpoint | Auth | Body/Query | Returns |
|--------|----------|------|-----------|---------|
| POST | `/api/trips/create` | ✅ | `{name, destination, startDate, endDate, members}` | `{success, data: Trip}` |
| GET | `/api/trips/user` | ✅ | - | `{success, data: Trip[]}` |
| GET | `/api/trips/:id` | ✅ | - | `{success, data: Trip}` |
| GET | `/api/trips/:id/settlements` | ✅ | - | `{success, data: [{from, to, amount}]}` |
| GET | `/api/trips/:id/analytics` | ✅ | - | `{success, data: {...breakdown}}` |
| POST | `/api/trips/:id/add-member` | ✅ | `{email}` | `{success, data: Trip}` |
| POST | `/api/trips/:id/respond` | ✅ | `{response: joined\|rejected}` | `{success}` |
| POST | `/api/trips/:id/end` | ✅ | - | `{success}` |
| GET | `/api/trips/:id/itinerary` | ✅ | - | `{success, data: Activity[]}` |
| POST | `/api/trips/:id/itinerary` | ✅ | `{title, date, time?, location?, notes?}` | `{success, data: Activity}` |
| GET | `/api/trips/:id/packing` | ✅ | - | `{success, data: PackingItem[]}` |
| POST | `/api/trips/:id/packing` | ✅ | `{text, category?}` | `{success, data: PackingItem}` |
| PUT | `/api/trips/:id/packing` | ✅ | `{itemId, isChecked}` | `{success, data: PackingItem}` |
| DELETE | `/api/trips/:id/packing` | ✅ | `itemId` | `{success}` |
| GET | `/api/trips/:id/chat` | ✅ | `limit?, skip?` | `{success, data: Message[]}` |
| POST | `/api/trips/:id/chat` | ✅ | `{content}` | `{success, data: Message}` |

---

## HTTP Status Codes

| Code | Meaning | Examples |
|------|---------|----------|
| 200 | OK | GET, PUT, DELETE success |
| 201 | Created | POST success |
| 400 | Bad Request | Missing fields, validation error |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal error |

---

## Common Error Codes

| Code | Meaning |
|------|---------|
| `AUTH_TOKEN_MISSING` | No authentication token provided |
| `AUTH_TOKEN_EXPIRED` | Token has expired |
| `AUTH_TOKEN_INVALID` | Token is malformed or invalid |
| `VALIDATION_ERROR` | Request body validation failed |
| `RESOURCE_NOT_FOUND` | Resource with given ID doesn't exist |
| `PERMISSION_DENIED` | User doesn't have permission for this operation |

---

## Split Type Examples

| Type | Example | Calculation |
|------|---------|-------------|
| `equally` | 1000 among 4 people | ₹250 each |
| `unequally` | `{Alice: 600, Bob: 400}` | Exact amounts |
| `percentage` | `{Alice: 60%, Bob: 40%}` | 600 & 400 from 1000 |
| `shares` | `{Alice: 3, Bob: 1}` | ₹750 & ₹250 (3:1 ratio) |

---

## Required Fields by Operation

### New Expense
- title ✅
- amount ✅ (>0)
- paidBy ✅
- splitBetween ✅ (non-empty)
- splitType ✅

### New Group
- name ✅
- type ✅

### New Settlement
- fromUserId ✅
- toUserId ✅
- amount ✅ (>0)
- method ✅

### New Budget
- category ✅
- limit ✅ (>0)
- month ✅ (1-12)
- year ✅

### New Personal Expense
- amount ✅
- description ✅
- category ✅
- paymentMethod ✅
- expenseDate ✅

---

## Pagination

**Standard Parameters:**
```
limit (default: varies 20-100)
skip (default: 0)
```

**Example:**
```
GET /api/expenses/group/123?limit=50&skip=100
// Gets items 101-150
```

---

## Authentication

**Header Method:**
```
Authorization: Bearer <access_token>
```

**Cookie Method (automatic):**
```
Cookie: accessToken=<token>
```

**Token Storage:**
- ✅ Web: HTTP-only cookies
- ✅ Mobile: SecureStore/Keychain

---

## Notes

- All amounts in base currency (default: INR)
- Timestamps in ISO 8601 format
- ObjectId strings are 24 hex characters
- Dates use UTC, analytics use IST
- Max search results: 5 users
- Max notifications per request: 50
- Cooldown: 24h between settlement reminders

---

**For Detailed Documentation:** See `BACKEND_API_SPECIFICATION.md`  
**For Implementation Guide:** See `IMPLEMENTATION_SYNC_GUIDE.md`
