# API Implementation Sync Guide - Web & Mobile Apps

**Purpose:** Quick reference for ensuring Web and Mobile apps are synchronized with Backend API  
**Created:** April 2026  
**Based On:** BACKEND_API_SPECIFICATION.md  

---

## Quick Checklist for Development Teams

### Critical Path: Core Features

#### [ ] Authentication
- [ ] Web: Login/Register forms match backend validation (min 6 char password)
- [ ] Mobile: Login/Register forms match backend validation
- [ ] Both: Store tokens in secure storage (HTTP-only cookies on web, secure storage on mobile)
- [ ] Both: Implement 401 redirect to login on token expiry
- [ ] Both: Handle google-login flow with googleId parameter

#### [ ] User Profile
- [ ] Web: Profile page displays user data from GET `/api/user/me`
- [ ] Mobile: Profile page displays user data from GET `/api/user/me`
- [ ] Both: Profile image upload to POST `/api/user/upload-profile`
- [ ] Both: QR code upload to POST `/api/user/upload-qr`
- [ ] Both: Edit profile with PUT `/api/user/update`
- [ ] Both: Search users with GET `/api/user/search?query=...`

#### [ ] Groups (Core)
- [ ] Web: Create group with POST `/api/groups`
- [ ] Mobile: Create group with POST `/api/groups`
- [ ] Both: Fetch all user groups with GET `/api/groups`
- [ ] Both: Fetch group details with GET `/api/groups/:id`
- [ ] Both: Add members to group POST `/api/groups/:id/members`
- [ ] Both: Remove members DELETE `/api/groups/:id/members/:memberId`
- [ ] Both: Delete group DELETE `/api/groups/:id`
- [ ] Web: Group type must be one of: 'personal' | 'trip' | 'college' | 'food' | 'flatmates' | 'event' | 'custom'
- [ ] Mobile: Group type must be one of: 'personal' | 'trip' | 'college' | 'food' | 'flatmates' | 'event' | 'custom'

#### [ ] Expenses (Core)
- [ ] Web: Add expense with POST `/api/expenses/add`
- [ ] Mobile: Add expense with POST `/api/expenses/add`
- [ ] Both: Validate split types: 'equally' | 'unequally' | 'percentage' | 'shares'
- [ ] Both: Fetch group expenses GET `/api/expenses/group/:id`
- [ ] Both: Update expense PUT `/api/expenses/:id`
- [ ] Both: Delete expense DELETE `/api/expenses/:id`
- [ ] Both: Calculate balances GET `/api/expenses/group/:id/balances`

**CRITICAL:** Split calculation must match backend:
```
// Equally: amount / participants.length
// Unequally: map from splitAmounts
// Percentage: (amount * percentage) / 100
// Shares: (amount * shares_for_person) / total_shares
```

#### [ ] Settlements (Core)
- [ ] Web: Show pending settlements GET `/api/settlements/pending`
- [ ] Mobile: Show pending settlements GET `/api/settlements/pending`
- [ ] Both: Show settlement history GET `/api/settlements/history`
- [ ] Both: Record settlement POST `/api/settlements`
- [ ] Both: Mark settlement received PUT `/api/settlements/:id/mark-received`
- [ ] Both: Handle partial payments PUT `/api/settlements/:id/partial`
- [ ] Web: Display settlement reminder feature POST `/api/settlements/remind`
- [ ] Mobile: Display settlement reminder feature POST `/api/settlements/remind`

---

## Required Fields by Operation

### Create Expense
```typescript
REQUIRED:
- title: string (non-empty)
- amount: number (> 0)
- paidBy: ObjectId (string representation)
- groupId or tripId: ObjectId
- splitBetween: ObjectId[] (non-empty)
- splitType: 'equally' | 'unequally' | 'percentage' | 'shares'

OPTIONAL:
- category: string
- receiptUrl: string
- notes: string
- date: Date

CONDITIONAL:
- If splitType === 'unequally': splitAmounts required
- If splitType === 'percentage': splitPercentages required (or calculate from amounts)
- If splitType === 'shares': splitShares required
```

### Create Settlement
```typescript
REQUIRED:
- fromUserId: string (who owes)
- toUserId: string (who receives)
- amount: number (> 0)
- method: 'cash' | 'upi' | 'bank'

OPTIONAL:
- groupId: string
- type: 'full' | 'partial'
- note: string
```

### Create Budget
```typescript
REQUIRED:
- category: string
- limit: number (> 0)
- month: number (1-12)
- year: number

NOTE: One budget per user/category/month/year (unique constraint)
```

### Create Personal Expense
```typescript
REQUIRED:
- amount: number (>= 0)
- description: string
- category: string
- paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other'
- expenseDate: Date

OPTIONAL:
- isRecurring: boolean
- recurringType: 'daily' | 'monthly' | 'weekly' (only if isRecurring)
- note: string
- receiptUrl: string
```

---

## Response Data Structures to Implement

### User Object (in responses)
```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  profileImage: string,
  phone?: string,
  upiId?: string,
  preferences: {
    theme: 'dark' | 'light' | 'system',
    monthlyIncome?: number,
    monthlyBudget?: number,
    savingsGoal?: number,
    currency: string,
    notifications: {
      groupExpenseAdded: boolean,
      personalExpenseReminder: boolean,
      settlementReminder: boolean,
      budgetAlert: boolean,
      weeklySummary: boolean
    }
  },
  paymentPreferences: {
    upiId: string,
    bankAccount?: string,
    autoPay: boolean
  },
  createdAt: Date
}
```

### Group Object (in responses)
```typescript
{
  _id: ObjectId,
  name: string,
  type: 'personal' | 'trip' | 'college' | 'food' | 'flatmates' | 'event' | 'custom',
  emoji: string,
  description?: string,
  createdBy: ObjectId,
  members: Array<{
    userId: ObjectId,
    userName: string,
    email: string,
    role: 'creator' | 'member',
    status?: 'invited' | 'joined' | 'rejected'
  }>,
  expenses: ObjectId[],
  totalSpent: number,
  netBalance: number,
  isActive: boolean,
  status?: 'active' | 'completed',
  // If type === 'trip':
  tripStartDate?: Date,
  tripEndDate?: Date,
  tripDestination?: string,
  tripBudget?: number,
  trackBudget?: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Expense Object (in responses)
```typescript
{
  _id: ObjectId,
  title: string,
  amount: number,
  category: string,
  paidBy: ObjectId,
  trip?: ObjectId,
  group?: ObjectId,
  splitBetween: ObjectId[],
  splitType: 'equally' | 'unequally' | 'percentage' | 'shares',
  splitAmounts?: Object,
  splitPercentages?: Object,
  splitShares?: Object,
  date: Date,
  receiptUrl?: string,
  notes?: string
}
```

### Balance Row Object (GET /api/expenses/group/:id/balances)
```typescript
{
  userId: string,
  userName: string,
  netBalance: number,      // Positive: owed money, Negative: owes money
  paid: number,            // Total paid by user
  owedShare: number        // Total share of group expenses
}
```

### Settlement Object (in responses)
```typescript
{
  _id: ObjectId,
  fromUser: ObjectId,
  toUser: ObjectId,
  amount: number,
  type: 'full' | 'partial',
  amountPaid: number,
  remaining: number,
  group?: ObjectId,
  source: 'group' | 'personal' | 'direct',
  method: 'cash' | 'upi' | 'bank',
  note?: string,
  dueDate?: Date,
  remindedAt?: Date,
  remindCount: number,
  createdBy: ObjectId,
  status: 'completed' | 'reversed',
  createdAt: Date,
  updatedAt: Date
}
```

### Balance Summary (GET /api/groups/:id/summary)
```typescript
{
  totalExpenses: number,
  totalAmount: number,
  memberCount: number,
  balances: Array<BalanceRow>
}
```

---

## Common Implementation Mistakes to Avoid

### ❌ DON'T
1. Hardcode currency symbol - use `currency` from user preferences
2. Calculate settlements without netting duplicate debts
3. Split expenses by counting participant IDs without filtering
4. Store plain-text passwords - passwords must be hashed (bcrypt on backend)
5. Forget to include splitBetween array when creating expenses
6. Use local time zones without IST conversion in analytics
7. Display settlement amounts without 2 decimal precision
8. Assume all endpoints return data at top level - check response structure

### ✅ DO
1. Use response structure: `{ success: boolean, data: {...} }`
2. Validate all required fields before sending requests
3. Handle token expiry by showing login screen
4. Format amounts with currency symbol: `₹XXXX`
5. Round currency amounts to 2 decimals for display
6. Use `Map` structure for split calculations in requests
7. Include proper error handling for all API calls
8. Show loading states during API operations

---

## Split Calculation Reference

### Test Cases for Split Types

#### Test 1: Equally
```
Expense: ₹1000 split equally among [Alice, Bob, Charlie]
Expected:
- Alice pays: 0 (she's payer)
- Bob owes: ₹333.33
- Charlie owes: ₹333.33
```

#### Test 2: Unequally
```
Expense: ₹1000 paid by Alice, split unequally [Bob: 600, Charlie: 400]
Expected:
- Alice's balance: +1000 (paid)
- Bob owes: 600
- Charlie owes: 400
```

#### Test 3: Percentage
```
Expense: ₹1000 split [Alice: 30%, Bob: 70%]
Expected:
- Alice's share: 300
- Bob's share: 700
```

#### Test 4: Shares
```
Expense: ₹1000 split [Alice: 1 share, Bob: 3 shares]
Total shares: 4
Expected:
- Alice's share: 250 (1/4 of 1000)
- Bob's share: 750 (3/4 of 1000)
```

---

## API Response Validation

### Always Check Response Structure
```typescript
// ✅ CORRECT
const response = await fetch('/api/groups');
const { success, data } = await response.json();
if (success && data) {
  // Use data
}

// ❌ WRONG
const response = await fetch('/api/groups');
const groups = await response.json(); // Missing success check and data property
```

### Handle Errors Properly
```typescript
// ✅ CORRECT
try {
  const response = await fetch('/api/expenses/add', {
    method: 'POST',
    body: JSON.stringify(expenseData)
  });
  if (response.status === 401) {
    // Redirect to login
  }
  const { success, data, message } = await response.json();
  if (!success) {
    console.error(message);
  }
} catch (error) {
  // Network error
}

// ❌ WRONG
const { data } = await fetch('/api/expenses/add').json();
// Missing error handling, assuming success
```

---

## Pagination Implementation

### Standard Query Parameters
```typescript
// Most endpoints support:
- limit: number (default varies: 50, 100 based on endpoint)
- skip: number (default: 0)

// Examples:
GET /api/settlements/history?limit=20&skip=0
GET /api/personal-expenses?limit=50&skip=100  // Page 3 with 50 items/page
GET /api/expenses/group/123?limit=15&skip=15  // Page 2 with 15 items/page
```

### Response Format for Paginated Endpoints
```typescript
{
  success: boolean,
  data: [...],
  total: number,      // Total count of items
  page?: number,
  limit?: number,
  skip?: number
}
```

---

## Authentication Token Management

### Token Flow Diagram
```
1. User calls POST /api/auth/login
   ↓
2. Backend returns: { token, refreshToken, user }
   ↓
3. Store tokens securely:
   - Web: HTTP-only cookies (automatic in axios/fetch with credentials)
   - Mobile: SecureStore.setItemAsync(token)
   ↓
4. Include token in all subsequent requests:
   - Header: Authorization: Bearer <token>
   - OR Cookie (automatic if stored)
   ↓
5. If 401 response:
   - Attempt token refresh with refreshToken
   - Get new access token
   - Retry original request
   ↓
6. If refresh fails or no refresh token: Redirect to login
```

### Token Expiry Handling
```typescript
// ✅ RECOMMENDED
const handleTokenExpiry = (error) => {
  if (error.response?.status === 401) {
    const code = error.response?.data?.code;
    if (code === 'AUTH_TOKEN_EXPIRED') {
      // Attempt refresh
      return refreshAccessToken();
    }
    if (code === 'AUTH_TOKEN_MISSING' || code === 'AUTH_TOKEN_INVALID') {
      // Redirect to login
      navigateToLogin();
    }
  }
};
```

---

## Category Management

### Predefined Categories
```typescript
const CATEGORY_EMOJIS = {
  food: '🍔',
  transport: '🚗',
  accommodation: '🏨',
  entertainment: '🎬',
  shopping: '🛍️',
  groceries: '🛒',
  health: '💊',
  utilities: '💡',
  other: '📦'
};
```

### Custom Categories
Users can define custom categories via `PUT /api/profile/categories`
Structure: `{ id, name, icon, color, enabled, isCustom: true }`

---

## Timezone Handling

### IST Offset
```javascript
const IST_OFFSET = 330; // 5 hours 30 minutes

// For analytics endpoints that use IST:
// Backend calculates month boundaries in IST
// Frontend should be aware when comparing local to IST
```

### Date Formatting
- Store: UTC in MongoDB
- Display: Convert to user timezone
- For reports/analytics: Use IST (India Standard Time)

---

## Notifications Type Reference

```typescript
enum NotificationType {
  'invite' = 'Trip/Group invite',
  'expense' = 'Expense related',
  'activity' = 'Activity update',
  'system' = 'System message',
  'settled' = 'Settlement completed',
  'expense_added' = 'New expense added',
  'budget_alert' = 'Budget exceeded',
  'payment_reminder' = 'Payment due reminder',
  'group_invite' = 'Group invitation',
  'monthly_report' = 'Monthly summary report',
  'payment_received' = 'Payment received',
  'payment_confirmed' = 'Payment confirmed',
  'partial_payment' = 'Partial payment received',
  'mark_received' = 'Marked as received'
}
```

---

## Testing Checklist

### Before Deploying to Production

#### Authentication
- [ ] Login with email/password
- [ ] Login with Google
- [ ] Token refresh works when access expires
- [ ] Logout clears tokens
- [ ] 401 redirects to login
- [ ] Unauthorized endpoints reject unauthenticated requests

#### Expenses
- [ ] Create expense with all 4 split types
- [ ] Edit expense
- [ ] Delete expense
- [ ] Verify balance calculations match expected
- [ ] Handle currency rounding (2 decimals)

#### Settlements
- [ ] Create settlement from balanced expenses
- [ ] Record full settlement
- [ ] Record partial settlement
- [ ] Verify remaining amount updates
- [ ] Test settlement reminder (24h cooldown)
- [ ] Mark settlement as received

#### Data Validation
- [ ] Reject missing required fields
- [ ] Reject invalid split percentages (not summing to 100)
- [ ] Reject negative amounts
- [ ] Reject invalid date ranges (end before start)
- [ ] Reject duplicate group members

---

## Performance Optimization Tips

1. **Caching**: Cache user profile, group list on app load
2. **Pagination**: Always paginate expense/settlement lists
3. **Batch Updates**: Group multiple category operations in single request
4. **Lazy Loading**: Load settlement history on scroll
5. **Debouncing**: Debounce search user by 300ms
6. **Prefetching**: Fetch analytics data in background

---

## Migration from Old to New API

If migrating existing implementations:
1. Map old response structures to new ones
2. Update split calculation logic
3. Verify settlement optimization algorithm
4. Test 100 different expense scenarios
5. Update error handling for new error codes
6. Migrate stored preferences/settings

---

**End of Implementation Sync Guide**
