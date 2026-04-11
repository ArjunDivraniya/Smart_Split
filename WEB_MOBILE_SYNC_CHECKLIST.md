# SmartSplit Web & Mobile - Implementation Sync Checklist

## 🎯 Goal
Ensure both web (React/Next.js) and mobile (React Native/Expo) apps:
1. Use the SAME backend APIs
2. Handle responses identically
3. Have consistent UX flows
4. Display the same data the same way

---

## 📋 AUTHENTICATION SYNC

### Web App - AUTH Implementation
- [x] Register endpoint: POST `/auth/register` 
- [x] Login endpoint: POST `/auth/login`
- [x] Token storage: localStorage + NextAuth session
- [x] Token in headers: `Authorization: Bearer {token}`
- [x] Google OAuth: Configured
- [x] Token expiry handling: Refresh on 401
- [x] Logout clears tokens: Implemented

### Mobile App - AUTH Implementation  
- [ ] Register endpoint: POST `/auth/register` (SAME as web)
- [ ] Login endpoint: POST `/auth/login` (SAME as web)
- [ ] Token storage: Secure storage (Expo SecureStore)
- [ ] Token in headers: `Authorization: Bearer {token}` (SAME format)
- [ ] Google OAuth: Configure (SAME method)
- [ ] Token expiry handling: Refresh on 401 (SAME logic)
- [ ] Logout clears tokens: Remove from secure storage

**Sync Status**: Auth structure ready. Mobile needs implementation with same error handling.

---

## 💰 FINANCIAL DATA SYNC

### Amount Handling
**Backend**: Stores in PAISE (1/100 rupee)

**Web Implementation Required**:
```typescript
// Convert from paise to display
const formatCurrency = (paise: number) => {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(rupees);
};

// On form submit - convert back to paise
const amountInPaise = parseFloat(formData.amount) * 100;
```

**Mobile Implementation Required**:
```typescript
// IDENTICAL function needed for React Native
const formatCurrency = (paise: number) => {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(rupees);
};
```

- [x] Web: Format amounts correctly
- [ ] Mobile: Format amounts identically
- **Status**: Web done, Mobile needed

---

## 📊 SPLIT CALCULATIONS SYNC

### 4 Split Types (Must be identical in BOTH apps)

**Type 1: Equally**
```json
{
  "splitType": "equally",
  "splitBetween": ["userId1", "userId2", "userId3"],
  "amount": 30000  // 300 rupees
  // Each person owes: 30000/3 = 10000 paise
}
```

**Type 2: Unequally** 
```json
{
  "splitType": "unequal",
  "splitDetails": {
    "userId1": 10000,
    "userId2": 15000,
    "userId3": 5000
  },
  "amount": 30000  // Must sum up
}
```

**Type 3: Percentage**
```json
{
  "splitType": "percentage",
  "splitDetails": {
    "userId1": 50,
    "userId2": 30,
    "userId3": 20
  },
  "amount": 30000
  // userId1 owes: 30000 * 0.50 = 15000
}
```

**Type 4: Shares (Weighted)**
```json
{
  "splitType": "shares",
  "splitDetails": {
    "userId1": 3,
    "userId2": 2,
    "userId3": 1
  },
  "amount": 30000
  // Total shares = 6. userId1 = 30000 * (3/6) = 15000
}
```

### Validation (Both apps must validate identically)

Web and Mobile MUST validate:
- [ ] Total amount matches input amount
- [ ] Percentages sum to 100% (type: percentage)
- [ ] Unequal amounts sum to total (type: unequal)
- [ ] At least 1 person in split
- [ ] Shares are positive numbers
- [ ] No duplicate users in split

**Code Pattern for Validation**:
```typescript
const validateSplit = (splitData) => {
  switch (splitData.splitType) {
    case 'percentage':
      const totalPercent = Object.values(splitData.splitDetails).reduce((a, b) => a + b, 0);
      if (totalPercent !== 100) throw new Error('Percentages must sum to 100%');
      break;
    case 'unequal':
      const totalAmount = Object.values(splitData.splitDetails).reduce((a, b) => a + b, 0);
      if (totalAmount !== splitData.amount) throw new Error('Amounts must sum to total');
      break;
    // ... etc
  }
};
```

- [x] Web: Validation logic needed
- [ ] Mobile: Validation logic needed (IDENTICAL)
- **Status**: Both need identical validation

---

## 📱 PAGE/SCREEN SYNC

### Authentication Pages
| Feature | Web | Mobile | Status |
|---------|-----|--------|--------|
| Register form | ✅ | ⏳ | Web done, Mobile needed |
| Login form | ✅ | ⏳ | Web done, Mobile needed |
| Password validation | ⏳ | ⏳ | Both need same rules |
| Error messages | ⏳ | ⏳ | Show SAME error codes |
| Google OAuth | ✅ | ⏳ | Web ready, Mobile needs |

### Dashboard Pages
| Feature | Web | Mobile | Endpoint | Status |
|---------|-----|--------|----------|--------|
| Total expenses | ✅ | ⏳ | `/analytics/dashboard` | Web done |
| You Owe | ✅ | ⏳ | `/analytics/dashboard` | Web done |
| You Owed | ✅ | ⏳ | `/analytics/dashboard` | Web done |
| Group count | ✅ | ⏳ | `/analytics/dashboard` | Web done |

### Groups Pages
| Feature | Web | Mobile | Endpoint | Status |
|---------|-----|--------|----------|--------|
| List groups | ⏳ | ⏳ | `GET /groups` | Both needed |
| Group details | ⏳ | ⏳ | `GET /groups/:id` | Both needed |
| Expense list | ⏳ | ⏳ | `GET /expenses/group/:id` | Both needed |
| Balance sheet | ⏳ | ⏳ | `GET /expenses/group/:id/balances` | Both needed |
| Add expense | ⏳ | ⏳ | `POST /expenses/add` | Both needed |
| Create group | ⏳ | ⏳ | `POST /groups` | Both needed |

### Personal Expenses
| Feature | Web | Mobile | Endpoint | Status |
|---------|-----|--------|----------|--------|
| List expenses | ⏳ | ⏳ | `GET /personal-expenses` | Both needed |
| Add expense | ⏳ | ⏳ | `POST /personal-expenses` | Both needed |
| Category filter | ⏳ | ⏳ | Same logic | Both needed |

### Analytics
| Feature | Web | Mobile | Endpoint | Status |
|---------|-----|--------|----------|--------|
| Monthly chart | ⏳ | ⏳ | `GET /analytics/monthly` | Both needed |
| Category pie | ⏳ | ⏳ | `GET /analytics/categories` | Both needed |
| Trends | ⏳ | ⏳ | `GET /analytics/trends` | Both needed |

### Other Features
| Feature | Web | Mobile | Endpoint | Status |
|---------|-----|--------|----------|--------|
| Friends list | ⏳ | ⏳ | `GET /friends` | Both needed |
| Settlements | ⏳ | ⏳ | `GET /settlements/user` | Both needed |
| Notifications | ⏳ | ⏳ | `GET /notifications` | Both needed |
| Profile | ⏳ | ⏳ | `GET /profile` | Both needed |

---

## 🔄 ERROR HANDLING SYNC

### Error Codes (Both apps must handle these IDENTICALLY)

```typescript
// Common error codes from backend
const ERROR_CODES = {
  AUTH_TOKEN_EXPIRED: 'Your session expired. Please login again.',
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
  AUTH_USER_NOT_FOUND: 'User account not found',
  VALIDATION_ERROR: 'Invalid data. Please check and try again.',
  INSUFFICIENT_PERMISSIONS: 'You don\'t have permission for this action',
  RESOURCE_NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'Server error. Please try again later.',
  DUPLICATE_ENTRY: 'This entry already exists',
  INVALID_OPERATION: 'This operation is not allowed',
};

// Web implementation
const handleApiError = (error) => {
  const message = ERROR_CODES[error.code] || error.message;
  toast.error(message); // Web toast
};

// Mobile implementation - must show same message
const handleApiError = (error) => {
  const message = ERROR_CODES[error.code] || error.message;
  Alert.alert('Error', message); // Mobile alert
};
```

- [x] Web: Basic error handling started
- [ ] Mobile: Identical error handling needed
- **Status**: Both need comprehensive error code mapping

---

## 🔐 TOKEN MANAGEMENT SYNC

### JWT Token Lifecycle (Must be identical)

**Both apps must implement**:

1. **On Login**:
   ```typescript
   // Store tokens
   localStorage.setItem('authToken', response.token); // Web
   await SecureStore.setItemAsync('authToken', response.token); // Mobile
   ```

2. **On API Call**:
   ```typescript
   headers['Authorization'] = `Bearer ${token}`;
   ```

3. **On 401 Response**:
   ```typescript
   // Get refresh token
   const newToken = await fetch('/auth/refresh', {
     body: { refreshToken: oldRefreshToken }
   });
   // Retry original request with new token
   ```

4. **On Logout**:
   ```typescript
   // Clear tokens
   localStorage.removeItem('authToken'); // Web
   await SecureStore.deleteItemAsync('authToken'); // Mobile
   // Redirect to login
   ```

- [x] Web: Basic token storage
- [ ] Mobile: Secure token storage needed
- [ ] Both: Refresh logic needed
- **Status**: Infrastructure needed

---

## 📲 Data Consistency Rules

### Rule 1: Same API Response Format
**All responses follow**:
```json
{
  "success": true/false,
  "data": {},
  "message": "...",
  "error": "ERROR_CODE",
  "timestamp": "2026-04-11T10:30:00Z"
}
```

Both apps MUST handle this format identically.

### Rule 2: Amount Precision
- Backend: Returns in PAISE
- Both apps: Convert to rupees for display
- Both apps: Convert to paise before sending

### Rule 3: Date Formatting
- Backend: Returns ISO 8601 (UTC)
- Both apps: Convert to IST for display
- Both apps: Use same date format (e.g., "Apr 11, 2026")

### Rule 4: Balance Calculation
```typescript
// Both apps must calculate the same way
const calculateBalance = (expenses) => {
  let youOwe = 0;
  let youOwed = 0;
  
  expenses.forEach(exp => {
    if (exp.paidBy === currentUserId) {
      youOwed += (exp.amount - yourShare);
    } else if (yourInShare) {
      youOwe += yourShare;
    }
  });
  
  return { youOwe, youOwed };
};
```

### Rule 5: Sort Order (Must match between apps)
- Groups: By name (A-Z)
- Expenses: By date (newest first)  
- Notifications: By date (newest first)
- Friends: By balance (highest owed to user first)

---

## 🧪 Testing Sync Strategy

### Test Case 1: Add Expense with Splits
**Procedure** (do on BOTH web and mobile):
1. Log in
2. Go to group "Test Group"
3. Add expense: "Dinner" - 30000 paise (₹300) - split equally between 3 people
4. Each person should owe: 10000 paise (₹100)
5. Check balance shown: 20000 paise

**Expected Result**: Both apps show SAME balances

### Test Case 2: Record Settlement
**Procedure** (do on BOTH web and mobile):
1. User A has expense with User B
2. A owes B: 5000 paise
3. A records payment on their app
4. B refreshes app
5. Both should see settlement completed

**Expected Result**: Both apps update simultaneously

### Test Case 3: Create Group with Members  
**Procedure**:
1. Web app creates group with 3 members
2. Mobile app queries same group
3. Compare: Same members displayed
4. Same total balance shown

**Expected Result**: Identical data, identical display

---

## ✅ Completion Checklist

### Phase 1: Web App Completion
- [ ] Groups listing with backend
- [ ] Group details with expenses
- [ ] Add expense form
- [ ] Create group form
- [ ] Personal expenses list
- [ ] Friends list
- [ ] Settlements page
- [ ] Analytics charts
- [ ] Notifications
- [ ] Profile settings
- [ ] Error handling for all error codes
- [ ] Loading states
- [ ] Form validation
- [ ] Currency/amount formatting
- [ ] Date formatting (IST)

### Phase 2: Mobile App Sync
- [ ] Auth flows (register/login)
- [ ] Dashboard with real data
- [ ] Groups listing & details
- [ ] Add expense form
- [ ] Create group form
- [ ] Personal expenses
- [ ] Friends list
- [ ] Settlements
- [ ] Analytics charts (mobile-optimized)
- [ ] Notifications
- [ ] Profile settings
- [ ] Identical error handling
- [ ] Identical validation
- [ ] Identical amount formatting
- [ ] Identical date formatting
- [ ] Offline caching (if applicable)

### Phase 3: Testing & QA
- [ ] Test all flows on web
- [ ] Test all flows on mobile
- [ ] Cross-app testing (create on web, view on mobile)
- [ ] Error scenario testing
- [ ] Token expiry & refresh testing
- [ ] Network error handling
- [ ] Performance testing

---

## 🚀 Critical Rules to Remember

1. **Single Backend Source**: Both apps query the SAME backend
2. **Identical Calculations**: Split logic, balances, amounts computed the SAME WAY
3. **Same Error Handling**: Error codes mapped to same messages
4. **Same Data Format**: Dates, amounts, currency displayed identically
5. **Same Validation**: Form inputs validated with same rules
6. **Same Sorting**: Data sorted in same order
7. **Same Authentication**: Token management must be identical
8. **Same API Client**: Use same endpoint paths and methods

---

## 📞 When in Doubt
- Check `BACKEND_API_SPECIFICATION.md` for exact endpoint details
- Check `API_QUICK_REFERENCE.md` for response shapes
- Check `IMPLEMENTATION_SYNC_GUIDE.md` for implementation patterns
- If values differ between web & mobile = BUG!

---

**Last Updated**: April 11, 2026
**Status**: Web foundation ready, Mobile pending
