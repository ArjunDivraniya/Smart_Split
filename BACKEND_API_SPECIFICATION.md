# SmartSplit Backend API Specification

**Document Version:** 1.0  
**Last Updated:** April 2026  
**Status:** Complete API Extract with Response Shapes and Database Models  

---

## Table of Contents
1. [Authentication](#authentication)
2. [API Endpoints by Category](#api-endpoints-by-category)
3. [Data Models & Database Schema](#data-models--database-schema)
4. [Request/Response Shapes](#requestresponse-shapes)
5. [Error Handling](#error-handling)
6. [Pagination & Filtering](#pagination--filtering)

---

## Authentication

### Auth Middleware (`authenticateToken`)
- **Location:** `Backend/src/middleware/auth.middleware.ts`
- **Type:** Bearer Token or Cookie-based
- **Token Sources:** 
  - Header: `Authorization: Bearer <token>`
  - Cookie: `accessToken` (default bearer)
  - Refresh Cookie: `refreshToken`
- **Response on Failure:** 
  ```json
  {
    "message": "Authentication required",
    "code": "AUTH_TOKEN_MISSING" | "AUTH_TOKEN_EXPIRED" | "AUTH_TOKEN_INVALID"
  }
  ```
- **Automatic Token Refresh:** If access token is expired but refresh token is valid, middleware automatically refreshes session

### Token Payload
```typescript
{
  userId: string;
  email: string;
  // Expires in 15 minutes (access token)
  // Expires in 7 days (refresh token)
}
```

---

## API Endpoints by Category

### 1. AUTH ENDPOINTS
**Base Path:** `/api/auth`  
**Authentication:** Public (except logout which sets cookies)

#### POST `/api/auth/register`
- **Auth Required:** No
- **Request Body:**
  ```typescript
  {
    name: string;          // Required, max 60 chars
    email: string;         // Required, unique, case-insensitive
    password: string;      // Required, min 6 chars
  }
  ```
- **Response (201):**
  ```typescript
  {
    message: string;
    success: boolean;
    userId: ObjectId;
  }
  ```
- **Error Cases:**
  - 400: Missing required fields
  - 400: Email already registered
  - 400: Password < 6 characters

#### POST `/api/auth/login`
- **Auth Required:** No
- **Request Body:**
  ```typescript
  {
    email: string;         // Required
    password: string;      // Required
  }
  ```
- **Response (200):**
  ```typescript
  {
    message: string;
    success: boolean;
    token: string;         // JWT Access token
    refreshToken: string;  // JWT Refresh token
    user: {
      id: ObjectId;
      name: string;
      email: string;
      profileImage: string;
    };
  }
  ```
- **Sets Cookies:**
  - `accessToken` (15 min expiry)
  - `refreshToken` (7 day expiry)

#### POST `/api/auth/google-login`
- **Auth Required:** No
- **Request Body:**
  ```typescript
  {
    email: string;
    name: string;
    googleId: string;
    profileImage?: string;
  }
  ```
- **Response (200):** Same as login endpoint
- **Note:** Creates new user if doesn't exist; links Google auth if credentials user

#### POST `/api/auth/refresh`
- **Auth Required:** No
- **Description:** Refresh access token using refresh token
- **Request:** Uses existing `refreshToken` cookie
- **Response (200):**
  ```typescript
  {
    token: string;         // New access token
    refreshToken: string;  // Optionally rotated refresh token
  }
  ```

#### POST `/api/auth/logout`
- **Auth Required:** No (but should be called by logged-in users)
- **Response (200):**
  ```typescript
  {
    message: "Logout successful",
    success: boolean;
  }
  ```
- **Clears Cookies:** `accessToken`, `refreshToken`

---

### 2. USER ENDPOINTS
**Base Path:** `/api/user`  
**Authentication:** Required for all endpoints

#### GET `/api/user/me`
- **Description:** Get current user's full profile
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: IUser;  // Full user document (see User Model)
  }
  ```

#### PUT `/api/user/update`
- **Request Body:**
  ```typescript
  {
    name?: string;
    phone?: string;
  }
  ```
- **Response (200):**
  ```typescript
  {
    success: boolean;
    message: string;
    data: IUser;  // Updated user object
  }
  ```

#### GET `/api/user/search?query=<string>`
- **Query Parameters:**
  - `query` (string, min 2 chars): Search term
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: Array<{
      _id: ObjectId;
      name: string;
      email: string;
      profileImage: string;
    }>;  // Max 5 results
  }
  ```
- **Search Fields:** name (case-insensitive), email (case-insensitive)

#### POST `/api/user/upload-profile`
- **Content-Type:** `multipart/form-data`
- **Form Field:** `file` (image file)
- **Response (200):**
  ```typescript
  {
    success: boolean;
    message: string;
    data: IUser;  // Updated user with profileImage and publicId
  }
  ```
- **Storage:** Cloudinary (`trip-splitter-profiles` folder)

#### POST `/api/user/upload-qr`
- **Content-Type:** `multipart/form-data`
- **Form Field:** `file` (image file)
- **Response (200):**
  ```typescript
  {
    success: boolean;
    message: string;
    data: IUser;  // Updated user with qrCode and qrPublicId
  }
  ```
- **Storage:** Cloudinary (`trip-splitter-qrcodes` folder)

#### DELETE `/api/user/delete-account`
- **Description:** Permanently delete user and all associated data
- **Response (200):**
  ```typescript
  {
    success: boolean;
    message: string;
  }
  ```
- **Side Effects:** Deletes from Cloudinary

---

### 3. PROFILE ENDPOINTS
**Base Path:** `/api/profile`  
**Authentication:** Required for all endpoints

#### GET `/api/profile`
- **Description:** Get full profile and computed stats
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: IUser;  // Complete user object with all preferences
  }
  ```

#### PUT `/api/profile`
- **Description:** Update basic profile fields
- **Request Body:**
  ```typescript
  {
    name?: string;
    phone?: string;
    email?: string;
    // Other user profile fields
  }
  ```
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: IUser;
  }
  ```

#### GET `/api/profile/stats`
- **Description:** Get computed profile statistics
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: {
      totalGroups: number;
      totalExpenses: number;
      totalSettlements: number;
      totalFriends: number;
      healthScore: number;  // 0-100
      // Additional computed stats
    };
  }
  ```

#### PUT `/api/profile/preferences`
- **Request Body:**
  ```typescript
  {
    theme?: 'dark' | 'light' | 'system';
    currency?: string;
    privacyMode?: boolean;
    notifications?: {
      groupExpenseAdded?: boolean;
      personalExpenseReminder?: boolean;
      settlementReminder?: boolean;
      budgetAlert?: boolean;
      weeklySummary?: boolean;
    };
  }
  ```
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: IUserPreferences;
  }
  ```

#### PUT `/api/profile/budget-goals`
- **Request Body:**
  ```typescript
  {
    monthlyIncome?: number;
    monthlyBudget?: number;
    savingsGoal?: number;
  }
  ```
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: IUser;
  }
  ```

#### PUT `/api/profile/payment-preferences`
- **Request Body:**
  ```typescript
  {
    upiId?: string;
    bankAccount?: string;
    autoPay?: boolean;
  }
  ```
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: PaymentPreferences;
  }
  ```

#### PUT `/api/profile/categories`
- **Request Body:**
  ```typescript
  {
    expenseCategories: Array<{
      id: string;
      name: string;
      icon: string;
      color: string;
      enabled: boolean;
      isCustom?: boolean;
    }>;
  }
  ```
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: IUser;
  }
  ```

#### PUT `/api/profile/privacy`
- **Request Body:**
  ```typescript
  {
    privacyMode?: boolean;
    hideBalances?: boolean;
    hideExpenses?: boolean;
    hideTransactions?: boolean;
    dataCollection?: boolean;
    analytics?: boolean;
    marketingEmails?: boolean;
  }
  ```
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: PrivacySettings;
  }
  ```

#### PUT `/api/profile/security`
- **Request Body:**
  ```typescript
  {
    appLockEnabled?: boolean;
    fingerprintEnabled?: boolean;
    faceRecognitionEnabled?: boolean;
    pinCode?: string;  // Should be hashed before storage
  }
  ```
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: SecuritySettings;
  }
  ```

#### PUT `/api/profile/change-password`
- **Request Body:**
  ```typescript
  {
    currentPassword: string;
    newPassword: string;
  }
  ```
- **Response (200):**
  ```typescript
  {
    success: boolean;
    message: string;
  }
  ```

#### GET `/api/profile/export`
- **Description:** Export all user data
- **Response:** JSON file download

#### POST `/api/profile/reset-savings`
- **Description:** Reset savings goal to default (5000)
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: IUser;
  }
  ```

---

### 4. GROUP ENDPOINTS
**Base Path:** `/api/groups`  
**Authentication:** Required for all endpoints (except health check)

#### GET `/api/groups/health/check` (Public)
- **Description:** Health check - verify groups collection exists
- **Auth Required:** No
- **Response (200):**
  ```typescript
  {
    message: string;
    groupsCollectionCount: number;
    status: 'ok';
  }
  ```

#### GET `/api/groups/debug/all-groups` (Debug)
- **Description:** Get ALL groups in database (debug endpoint)
- **Response (200):**
  ```typescript
  {
    currentUserId: string;
    totalGroupsInDB: number;
    groups: Array<{
      id: ObjectId;
      createdBy: ObjectId;
      name: string;
    }>;
  }
  ```

#### POST `/api/groups`
- **Description:** Create a new group
- **Request Body:**
  ```typescript
  {
    name: string;
    type: 'personal' | 'trip' | 'college' | 'food' | 'flatmates' | 'event' | 'custom';
    emoji?: string;
    description?: string;
    members?: string[];  // User IDs to add
    // If type === 'trip':
    tripStartDate?: Date;
    tripEndDate?: Date;
    tripDestination?: string;
    tripBudget?: number;
    trackBudget?: boolean;
  }
  ```
- **Response (201):**
  ```typescript
  {
    success: boolean;
    data: IGroup;
  }
  ```

#### GET `/api/groups`
- **Description:** Get all groups for current user
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: IGroup[];  // Groups where user is member or creator
  }
  ```

#### GET `/api/groups/:id`
- **Description:** Get specific group by ID
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: IGroup;
  }
  ```
- **Status:** 404 if group not found or user not member

#### GET `/api/groups/:id/timeline`
- **Description:** Get timeline information for a trip group
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: {
      timeline: Array<{
        date: Date;
        events: string[];
      }>;
    };
  }
  ```

#### PUT `/api/groups/:id`
- **Description:** Update group information
- **Request Body:**
  ```typescript
  {
    name?: string;
    description?: string;
    emoji?: string;
    tripBudget?: number;
    trackBudget?: boolean;
    // Other group fields
  }
  ```
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: IGroup;
  }
  ```
- **Authorization:** Only group creator can update

#### POST `/api/groups/:id/members`
- **Description:** Add member to group (duplicate-safe)
- **Request Body:**
  ```typescript
  {
    userId: string;  // OR
    email: string;
  }
  ```
- **Response (200):**
  ```typescript
  {
    success: boolean;
    message: string;
    data: IGroup;
  }
  ```
- **Note:** Won't add duplicate members

#### DELETE `/api/groups/:id/members/:memberId`
- **Description:** Remove member from group
- **Response (200):**
  ```typescript
  {
    success: boolean;
    message: string;
    data: IGroup;
  }
  ```

#### DELETE `/api/groups/:id`
- **Description:** Delete entire group
- **Response (200):**
  ```typescript
  {
    success: boolean;
    message: string;
  }
  ```
- **Authorization:** Only creator can delete

#### GET `/api/groups/:id/summary`
- **Description:** Get summary analytics for group
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: {
      totalExpenses: number;
      totalAmount: number;
      memberCount: number;
      balances: Array<{
        userId: string;
        userName: string;
        netBalance: number;  // Positive = owed, negative = owes
        paid: number;
        owedShare: number;
      }>;
    };
  }
  ```

#### GET `/api/groups/:id/settlements`
- **Description:** Get optimized settlement information for group
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: {
      settlements: Array<{
        fromUserId: string;
        fromUserName: string;
        toUserId: string;
        toUserName: string;
        amount: number;
      }>;
      balances: Array<{
        userId: string;
        netBalance: number;
      }>;
    };
  }
  ```
- **Algorithm:** Debt optimization with netting

#### POST `/api/groups/:id/settlements`
- **Description:** Record completed settlement transaction
- **Request Body:**
  ```typescript
  {
    fromUserId: string;
    toUserId: string;
    amount: number;
    method: 'cash' | 'upi' | 'bank';
    note?: string;
  }
  ```
- **Response (201):**
  ```typescript
  {
    success: boolean;
    data: Settlement;  // Created settlement record
  }
  ```

#### POST `/api/groups/:groupId/expenses`
- **Description:** Add expense to group
- **Request Body:** (see Expense endpoint)

#### DELETE `/api/groups/:groupId/expenses/:expenseId`
- **Description:** Remove expense from group
- **Response (200):**
  ```typescript
  {
    success: boolean;
    message: string;
  }
  ```

---

### 5. EXPENSE ENDPOINTS
**Base Path:** `/api/expenses`  
**Authentication:** Required for all endpoints

#### POST `/api/expenses/add`
- **Description:** Add new expense to group/trip
- **Request Body:**
  ```typescript
  {
    title: string;
    amount: number;
    category: string;
    paidBy: ObjectId;
    tripId?: ObjectId;
    groupId?: ObjectId;
    splitBetween: ObjectId[];
    splitType: 'equally' | 'unequally' | 'percentage' | 'shares';
    splitAmounts?: Map<string, number>;   // For 'unequally'
    splitPercentages?: Map<string, number>; // For 'percentage'
    splitShares?: Map<string, number>;    // For 'shares'
    receiptUrl?: string;
    notes?: string;
    date?: Date;  // Default: now
  }
  ```
- **Response (201):**
  ```typescript
  {
    success: boolean;
    data: IExpense;
  }
  ```
- **Validation:** All fields required; splitBetween not empty

#### GET `/api/expenses/group/:id`
- **Description:** Get all expenses for a group
- **Query Parameters:**
  - `limit?` (number, default 50)
  - `skip?` (number, default 0)
  - `sortBy?` ('date' | 'amount', default 'date')
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: IExpense[];
    total: number;  // Total expense count
  }
  ```
- **Sorting:** Default descending by date

#### GET `/api/expenses/group/:id/balances`
- **Description:** Get computed balances for all group members
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: Array<{
      userId: string;
      userName: string;
      netBalance: number;    // Positive = owed money, Negative = owes money
      paid: number;          // Total amount paid by user
      owedShare: number;     // Total share of expenses
    }>;
  }
  ```

#### PUT `/api/expenses/:id`
- **Description:** Update an expense
- **Request Body:** Same fields as POST (excluding splits which can't change)
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: IExpense;
  }
  ```
- **Authorization:** Only payer or group creator

#### DELETE `/api/expenses/:id`
- **Description:** Delete an expense
- **Response (200):**
  ```typescript
  {
    success: boolean;
    message: string;
  }
  ```
- **Authorization:** Only payer or group creator

---

### 6. SETTLEMENT ENDPOINTS
**Base Path:** `/api/settlements`  
**Authentication:** Required for all endpoints

#### GET `/api/settlements/user`
- **Description:** Get all settlements involving current user (newest first)
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: ISettlement[];  // Including both outgoing and incoming
  }
  ```

#### GET `/api/settlements/pending`
- **Description:** Get pending/overdue/partial settlements for current user
- **Query Parameters:**
  - `status?` ('pending' | 'partial' | 'overdue')
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: Array<{
      ...ISettlement;
      daysPending: number;
      isOverdue: boolean;
    }>;
  }
  ```

#### GET `/api/settlements/history`
- **Description:** Get completed settlement history with pagination and filtering
- **Query Parameters:**
  - `limit?` (number, default 50)
  - `skip?` (number, default 0)
  - `startDate?` (ISO string)
  - `endDate?` (ISO string)
  - `groupId?` (ObjectId)
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: ISettlement[];
    total: number;
    page: number;
  }
  ```
- **Filtering:** By date range, group, and user

#### GET `/api/settlements/group/:groupId`
- **Description:** Get settlement history for specific group (newest first)
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: ISettlement[];
  }
  ```

#### POST `/api/settlements`
- **Description:** Record a settlement payment (group-scoped or across groups)
- **Request Body:**
  ```typescript
  {
    fromUserId: string;
    toUserId: string;
    amount: number;
    groupId?: string;
    method: 'cash' | 'upi' | 'bank';
    type: 'full' | 'partial';
    note?: string;
  }
  ```
- **Response (201):**
  ```typescript
  {
    success: boolean;
    data: ISettlement;
  }
  ```

#### POST `/api/settlements/group/:id`
- **Description:** Record completed settlement for group (alternative route)
- **Request Body:** Same as POST `/api/settlements`
- **Response (201):**
  ```typescript
  {
    success: boolean;
    data: ISettlement;
  }
  ```

#### PUT `/api/settlements/:id/partial`
- **Description:** Record partial payment against existing settlement
- **Request Body:**
  ```typescript
  {
    amountPaid: number;  // Additional amount paid
  }
  ```
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: ISettlement;  // Updated with new remaining amount
  }
  ```

#### PUT `/api/settlements/:id/mark-received`
- **Description:** Receiver confirms payment is fully received
- **Request Body:**
  ```typescript
  {
    // Empty body, just confirm receipt
  }
  ```
- **Response (200):**
  ```typescript
  {
    success: boolean;
    message: string;
    data: ISettlement;  // Status updated to 'completed'
  }
  ```

#### POST `/api/settlements/remind`
- **Description:** Send settlement reminder to payer (24h cooldown)
- **Request Body:**
  ```typescript
  {
    settlementId: string;
  }
  ```
- **Response (200):**
  ```typescript
  {
    success: boolean;
    message: string;
    remindCount: number;
  }
  ```
- **Cooldown:** 24 hours between reminders

---

### 7. FRIENDS ENDPOINTS
**Base Path:** `/api/friends`  
**Authentication:** Required for all endpoints

#### GET `/api/friends/balances`
- **Description:** Get balances with all friends
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: Array<{
      friendId: string;
      friendName: string;
      friendImage: string;
      netBalance: number;  // Positive = friend owes you
      lastUpdated: Date;
    }>;
  }
  ```

#### GET `/api/friends/:id/history`
- **Description:** Get transaction history with specific friend
- **Query Parameters:**
  - `limit?` (number, default 50)
  - `skip?` (number, default 0)
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: {
      friend: {
        id: string;
        name: string;
        image: string;
      };
      transactions: Array<{
        settlementId: string;
        date: Date;
        type: 'paid' | 'received';
        amount: number;
        status: 'pending' | 'completed';
      }>;
    };
  }
  ```

---

### 8. BUDGET ENDPOINTS
**Base Path:** `/api/budgets`  
**Authentication:** Required for all endpoints

#### POST `/api/budgets`
- **Description:** Create budget for a category
- **Request Body:**
  ```typescript
  {
    category: string;
    limit: number;
    month: number;      // 1-12
    year: number;
  }
  ```
- **Response (201):**
  ```typescript
  {
    success: boolean;
    data: IBudget;
  }
  ```
- **Unique Constraint:** One budget per user/category/month/year

#### GET `/api/budgets/status`
- **Description:** Get budget status for current month
- **Query Parameters:**
  - `month?` (number, default current month)
  - `year?` (number, default current year)
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: Array<{
      category: string;
      limit: number;
      spent: number;
      remaining: number;
      percentage: number;  // 0-100
      status: 'ok' | 'warning' | 'exceeded';
    }>;
  }
  ```

#### PUT `/api/budgets/:id`
- **Description:** Update budget limit
- **Request Body:**
  ```typescript
  {
    limit: number;
  }
  ```
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: IBudget;
  }
  ```

#### DELETE `/api/budgets/:id`
- **Description:** Delete budget
- **Response (200):**
  ```typescript
  {
    success: boolean;
    message: string;
  }
  ```

---

### 9. NOTIFICATION ENDPOINTS
**Base Path:** `/api/notifications`  
**Authentication:** Required for all endpoints

#### GET `/api/notifications`
- **Description:** Get user notifications
- **Query Parameters:**
  - `limit?` (number, default 50)
  - `skip?` (number, default 0)
  - `isRead?` (boolean)
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: INotification[];
    unreadCount: number;
  }
  ```
- **Types:** invite, expense, activity, system, settled, expense_added, budget_alert, payment_reminder, group_invite, monthly_report, payment_received, payment_confirmed, partial_payment, mark_received

#### PUT `/api/notifications/:id/read`
- **Description:** Mark single notification as read
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: INotification;
  }
  ```

#### PUT `/api/notifications/read-all` OR PUT `/api/notifications`
- **Description:** Mark all notifications as read
- **Response (200):**
  ```typescript
  {
    success: boolean;
    message: string;
  }
  ```

#### DELETE `/api/notifications/clear`
- **Description:** Clear all notifications for current user
- **Response (200):**
  ```typescript
  {
    success: boolean;
    message: string;
  }
  ```

---

### 10. ANALYTICS ENDPOINTS
**Base Path:** `/api/analytics`  
**Authentication:** Required for all endpoints

#### GET `/api/analytics/monthly`
- **Description:** Get monthly spending data for last 6 months
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: Array<{
      month: string;        // "Jan'26"
      personal: number;     // Personal expense total
      group: number;        // Group expense total (paid by user)
      combined: number;     // Total
    }>;
  }
  ```

#### GET `/api/analytics/categories?month=<1-12>&year=<YYYY>`
- **Description:** Get category-wise spending breakdown for specific month
- **Query Parameters:**
  - `month` (required, 1-12)
  - `year` (required)
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: Array<{
      category: string;
      amount: number;
      percentage: number;  // 0-100
      emoji: string;
    }>;
  }
  ```

#### GET `/api/analytics/group-vs-personal`
- **Description:** Get 6-month group vs personal spending comparison
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: Array<{
      month: string;
      group: number;
      personal: number;
    }>;
  }
  ```

#### GET `/api/analytics/friend-spending`
- **Description:** Get top friends by shared group spending
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: Array<{
      friendId: string;
      friendName: string;
      totalShared: number;
      groupsCount: number;
    }>;
  }
  ```

#### GET `/api/analytics/trip/:id`
- **Description:** Get analytics for specific trip
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: {
      tripName: string;
      totalExpenses: number;
      categoryBreakdown: Array<{
        category: string;
        amount: number;
        percentage: number;
      }>;
      memberSpending: Array<{
        memberId: string;
        memberName: string;
        spent: number;
        share: number;
      }>;
    };
  }
  ```

#### GET `/api/analytics/recent-activity`
- **Description:** Get last 10 expenses across all trips
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: Array<{
      _id: ObjectId;
      title: string;
      amount: number;
      category: string;
      date: Date;
      trip: {
        _id: ObjectId;
        name: string;
      };
      paidBy: {
        name: string;
      };
    }>;
  }
  ```

#### GET `/api/analytics/insights`
- **Description:** Get dashboard insights
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: {
      topCategory: {
        category: string;
        amount: number;
        emoji: string;
        insight: string;  // e.g., "You spent the most on Food"
      };
      topFriend: {
        name: string;
        amount: number;
      };
    };
  }
  ```

#### GET `/api/analytics/dashboard`
- **Description:** Get dashboard summary with financial overview and smart alerts
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: {
      monthlySpending: number;
      budgetUtilization: number;  // 0-100%
      pendingSettlements: number;
      alerts: Array<{
        type: 'budget_exceeded' | 'overdue_payment' | 'savings_goal';
        message: string;
        severity: 'info' | 'warning' | 'critical';
      }>;
    };
  }
  ```

---

### 11. PERSONAL EXPENSE ENDPOINTS
**Base Path:** `/api/personal-expenses`  
**Authentication:** Required for all endpoints

#### POST `/api/personal-expenses`
- **Description:** Create personal expense
- **Request Body:**
  ```typescript
  {
    amount: number;
    description: string;
    category: string;
    paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other';
    expenseDate: Date;
    isRecurring: boolean;
    recurringType?: 'daily' | 'monthly' | 'weekly' | null;
    note?: string;
    receiptUrl?: string;
  }
  ```
- **Response (201):**
  ```typescript
  {
    success: boolean;
    data: IPersonalExpense;
  }
  ```

#### GET `/api/personal-expenses`
- **Description:** Get personal expenses with filters/pagination
- **Query Parameters:**
  - `limit?` (number, default 50)
  - `skip?` (number, default 0)
  - `category?` (string)
  - `startDate?` (ISO string)
  - `endDate?` (ISO string)
  - `isRecurring?` (boolean)
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: IPersonalExpense[];
    total: number;
  }
  ```

#### GET `/api/personal-expenses/summary`
- **Description:** Get monthly personal expense summary grouped by category
- **Query Parameters:**
  - `month?` (number, default current)
  - `year?` (number, default current)
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: Array<{
      category: string;
      total: number;
      count: number;
      percentage: number;
    }>;
  }
  ```

#### GET `/api/personal-expenses/:id`
- **Description:** Get single personal expense
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: IPersonalExpense;
  }
  ```

#### PUT `/api/personal-expenses/:id`
- **Description:** Update personal expense
- **Request Body:** Same as POST
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: IPersonalExpense;
  }
  ```

#### DELETE `/api/personal-expenses/:id`
- **Description:** Delete personal expense
- **Response (200):**
  ```typescript
  {
    success: boolean;
    message: string;
  }
  ```

---

### 12. TRIP ENDPOINTS
**Base Path:** `/api/trips`  
**Authentication:** Required for all endpoints

#### POST `/api/trips/create`
- **Description:** Create new trip
- **Request Body:**
  ```typescript
  {
    name: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    members: string[];  // Email addresses
  }
  ```
- **Response (201):**
  ```typescript
  {
    success: boolean;
    data: ITrip;
  }
  ```

#### GET `/api/trips/user`
- **Description:** Get all trips for current user
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: ITrip[];
  }
  ```

#### GET `/api/trips/:id`
- **Description:** Get trip details with expenses and balances
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: {
      ...ITrip;
      expenses: IExpense[];
      balances: Array<{
        userId: string;
        netBalance: number;
      }>;
    };
  }
  ```

#### GET `/api/trips/:id/settlements`
- **Description:** Get settlement calculations for trip
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: Array<{
      from: {
        id: string;
        name: string;
        avatar: string;
      };
      to: {
        id: string;
        name: string;
        avatar: string;
      };
      amount: number;
    }>;
  }
  ```
- **Algorithm:** Direct debt calculation with netting

#### GET `/api/trips/:id/analytics`
- **Description:** Get trip spending breakdown
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: {
      categoryBreakdown: Array<{
        category: string;
        amount: number;
      }>;
      memberSpending: Array<{
        memberId: string;
        name: string;
        spent: number;
      }>;
    };
  }
  ```

#### POST `/api/trips/:id/add-member`
- **Description:** Add member to trip
- **Request Body:**
  ```typescript
  {
    email: string;
  }
  ```
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: ITrip;
  }
  ```
- **Authorization:** Only trip creator

#### POST `/api/trips/:id/respond`
- **Description:** Accept or reject trip invitation
- **Request Body:**
  ```typescript
  {
    response: 'joined' | 'rejected';
  }
  ```
- **Response (200):**
  ```typescript
  {
    success: boolean;
    message: string;
  }
  ```

#### POST `/api/trips/:id/end`
- **Description:** End a trip
- **Response (200):**
  ```typescript
  {
    success: boolean;
    message: string;
  }
  ```
- **Authorization:** Only trip creator

#### GET `/api/trips/:id/itinerary`
- **Description:** Get trip activities/itinerary
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: IActivity[];
  }
  ```

#### POST `/api/trips/:id/itinerary`
- **Description:** Add activity to itinerary
- **Request Body:**
  ```typescript
  {
    title: string;
    date: Date;
    time?: string;
    location?: string;
    notes?: string;
  }
  ```
- **Response (201):**
  ```typescript
  {
    success: boolean;
    data: IActivity;
  }
  ```

#### GET `/api/trips/:id/packing`
- **Description:** Get packing checklist
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: IPackingItem[];
  }
  ```

#### POST `/api/trips/:id/packing`
- **Description:** Add item to packing list
- **Request Body:**
  ```typescript
  {
    text: string;
    category?: string;
  }
  ```
- **Response (201):**
  ```typescript
  {
    success: boolean;
    data: IPackingItem;
  }
  ```

#### PUT `/api/trips/:id/packing`
- **Description:** Toggle packing item (check/uncheck)
- **Request Body:**
  ```typescript
  {
    itemId: string;
    isChecked: boolean;
  }
  ```
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: IPackingItem;
  }
  ```

#### DELETE `/api/trips/:id/packing`
- **Description:** Delete packing item
- **Query Parameters:**
  - `itemId` (string)
- **Response (200):**
  ```typescript
  {
    success: boolean;
    message: string;
  }
  ```

#### GET `/api/trips/:id/chat`
- **Description:** Get trip chat messages
- **Query Parameters:**
  - `limit?` (number, default 50)
  - `skip?` (number, default 0)
- **Response (200):**
  ```typescript
  {
    success: boolean;
    data: IMessage[];
  }
  ```

#### POST `/api/trips/:id/chat`
- **Description:** Send message in trip chat
- **Request Body:**
  ```typescript
  {
    content: string;
  }
  ```
- **Response (201):**
  ```typescript
  {
    success: boolean;
    data: IMessage;
  }
  ```

---

## Data Models & Database Schema

### User Model
**Collection:** `users`  
**Location:** `Backend/src/models/User.model.ts`

```typescript
interface IUser extends Document {
  // Authentication
  name: string;                      // Max 60 chars, required
  email: string;                     // Unique, case-insensitive, required
  password?: string;                 // Optional (null for OAuth users), hashed with bcrypt
  authProvider: 'credentials' | 'google';
  
  // Profile
  phone?: string;
  profileImage?: string;             // Cloudinary URL
  publicId?: string;                 // Cloudinary public ID for deletion
  qrCode?: string;                   // Cloudinary URL for QR code
  qrPublicId?: string;              // Cloudinary public ID for QR
  upiId?: string;
  verified?: boolean;
  
  // Preferences
  preferences: {
    theme: 'dark' | 'light' | 'system';
    monthlyIncome?: number;
    monthlyBudget?: number;
    savingsGoal?: number;            // Default: 5000
    defaultSplit?: 'equally' | 'unequally' | 'percentage' | 'shares';
    defaultUpiId?: string;
    autoGenerateUpiLink: boolean;
    settlementConfirmation: boolean;
    currency: string;                // Default: 'INR'
    privacyMode: boolean;
    notifications: {
      groupExpenseAdded: boolean;
      personalExpenseReminder: boolean;
      settlementReminder: boolean;
      budgetAlert: boolean;
      weeklySummary: boolean;
    };
  };
  
  // Payment & Categories
  paymentPreferences: {
    upiId: string;
    bankAccount?: string;
    autoPay: boolean;
  };
  
  expenseCategories: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    enabled: boolean;
    isCustom?: boolean;
  }>;
  
  // Privacy & Security
  privacySettings: {
    privacyMode: boolean;
    hideBalances: boolean;
    hideExpenses: boolean;
    hideTransactions: boolean;
    dataCollection: boolean;
    analytics: boolean;
    marketingEmails: boolean;
  };
  
  securitySettings: {
    appLockEnabled: boolean;
    fingerprintEnabled: boolean;
    faceRecognitionEnabled: boolean;
    pinCode?: string;                // Hashed
  };
  
  // Timestamps
  createdAt: Date;
}
```

### Group Model
**Collection:** `groups`  
**Location:** `Backend/src/models/Group.model.ts`

```typescript
interface IGroup extends Document {
  // Basic Info
  name: string;
  type: 'personal' | 'trip' | 'college' | 'food' | 'flatmates' | 'event' | 'custom';
  emoji: string;                     // Default: '👥'
  coverImage?: string;
  description?: string;
  
  // Membership
  createdBy: ObjectId;               // Ref: User
  members: Array<{
    userId: ObjectId;                // Ref: User
    userName: string;
    email: string;
    role: 'creator' | 'member';
    status?: 'invited' | 'joined' | 'rejected';
  }>;
  
  // Content
  expenses: ObjectId[];              // Ref: Expense
  
  // Financials
  totalSpent: number;
  netBalance: number;
  
  // Status
  isActive: boolean;
  status?: 'active' | 'completed';
  
  // Trip-specific fields (optional, only for type='trip')
  tripStartDate?: Date;
  tripEndDate?: Date;
  tripDestination?: string;
  tripBudget?: number;
  trackBudget?: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

**Indices:**
- `createdBy: 1`
- `members.userId: 1`
- `type: 1`

### Expense Model
**Collection:** `expenses`  
**Location:** `Backend/src/models/Expense.model.ts`

```typescript
interface IExpense extends Document {
  // Description
  title: string;                     // Required
  amount: number;                    // In base currency
  category: string;                  // Required
  date: Date;                        // Default: now
  
  // Participants
  paidBy: ObjectId;                  // Ref: User, required
  trip?: ObjectId;                   // Ref: Trip
  group?: ObjectId;                  // Ref: Group
  splitBetween: ObjectId[];          // Ref: User[]
  
  // Split Configuration
  splitType: 'equally' | 'unequally' | 'percentage' | 'shares';
  splitAmounts: Map<string, number>;     // For 'unequally'
  splitPercentages: Map<string, number>; // For 'percentage' (0-100)
  splitShares: Map<string, number>;      // For 'shares'
  
  // Optional
  receiptUrl?: string;               // File URL
  notes?: string;
}
```

**Indices:**
- `group: 1, date: -1`
- `trip: 1, date: -1`

### Settlement Model
**Collection:** `settlements`  
**Location:** `Backend/src/models/Settlement.model.ts`

```typescript
interface ISettlement extends Document {
  // Participants
  fromUser: ObjectId;                // Ref: User, who owes money
  toUser: ObjectId;                  // Ref: User, who receives money
  
  // Amount
  amount: number;                    // Total settlement amount
  type: 'full' | 'partial';          // Payment type
  amountPaid: number;                // Amount already paid
  remaining: number;                 // Auto-calculated: amount - amountPaid
  
  // Reference
  group?: ObjectId;                  // Ref: Group (if group-scoped)
  
  // Tracking
  dueDate?: Date;
  remindedAt?: Date;
  remindCount: number;               // 24h cooldown between reminders
  
  // Details
  source: 'group' | 'personal' | 'direct';
  method: 'cash' | 'upi' | 'bank';
  note?: string;
  
  // Management
  createdBy: ObjectId;               // Ref: User, who recorded this
  status: 'completed' | 'reversed';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

**Indices:**
- `group: 1, createdAt: -1`

### Budget Model
**Collection:** `budgets`  
**Location:** `Backend/src/models/Budget.model.ts`

```typescript
interface IBudget extends Document {
  // Reference
  user: ObjectId;                    // Ref: User, required
  
  // Budget Details
  category: string;                  // Required, max 64 chars
  limit: number;                     // Budget limit in base currency
  
  // Period
  month: number;                     // 1-12
  year: number;                      // 2000-3000
  
  // Status
  alertSent: boolean;                // Whether alert was sent for this month
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

**Unique Constraint:**
- `user: 1, month: 1, year: 1, category: 1` (unique)

### PersonalExpense Model
**Collection:** `personalexpenses`  
**Location:** `Backend/src/models/PersonalExpense.model.ts`

```typescript
interface IPersonalExpense extends Document {
  // Reference
  user: ObjectId;                    // Ref: User, required
  
  // Details
  amount: number;                    // Required, min: 0
  description: string;               // Required, max 200 chars
  category: string;                  // Required, max 64 chars
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Other';
  
  // Date & Recurrence
  expenseDate: Date;                 // Required
  isRecurring: boolean;              // Default: false
  recurringType?: 'daily' | 'monthly' | 'weekly' | null;
  
  // Optional
  note?: string;                     // Max 500 chars
  receiptUrl?: string;               // File URL
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

**Indices:**
- `user: 1, expenseDate: -1`
- `user: 1, category: 1, expenseDate: -1`

### Trip Model
**Collection:** `trips`  
**Location:** `Backend/src/models/Trip.model.ts`

```typescript
interface ITrip extends Document {
  // Details
  name: string;                      // Required
  destination: string;               // Required
  
  // Dates
  startDate: Date;                   // Required
  endDate: Date;                     // Required
  
  // Status
  status: 'active' | 'completed';    // Default: 'active'
  
  // Creator
  createdBy: ObjectId;               // Ref: User, required
  
  // Participants
  members: Array<{
    email: string;                   // Required
    userId?: ObjectId;               // Ref: User
    status: 'invited' | 'joined' | 'rejected';
  }>;
  
  // Content
  expenses: ObjectId[];              // Ref: Expense[]
  
  // Timestamps
  createdAt: Date;
}
```

### Notification Model
**Collection:** `notifications`  
**Location:** `Backend/src/models/Notification.model.ts`

```typescript
interface INotification extends Document {
  // Recipient & Sender
  recipient: ObjectId;               // Ref: User, required
  sender?: ObjectId;                 // Ref: User
  
  // Context
  trip?: ObjectId;                   // Ref: Trip
  group?: ObjectId;                  // Ref: Group
  
  // Content
  message: string;                   // Required
  type: 'invite'
       | 'expense'
       | 'activity'
       | 'system'
       | 'settled'
       | 'expense_added'
       | 'budget_alert'
       | 'payment_reminder'
       | 'group_invite'
       | 'monthly_report'
       | 'payment_received'
       | 'payment_confirmed'
       | 'partial_payment'
       | 'mark_received';
  
  // Status
  isRead: boolean;                   // Default: false
  
  // Timestamp
  createdAt: Date;
}
```

### Activity Model
**Collection:** `activities`  
**Location:** `Backend/src/models/Activity.model.ts`

```typescript
interface IActivity extends Document {
  // Reference
  trip: ObjectId;                    // Ref: Trip, required
  
  // Details
  title: string;                     // Required
  date: Date;                        // Required
  time?: string;
  location?: string;
  notes?: string;
  
  // Creator
  createdBy?: ObjectId;              // Ref: User
}
```

### Message Model
**Collection:** `messages`  
**Location:** `Backend/src/models/Message.model.ts`

```typescript
interface IMessage extends Document {
  // Reference
  trip: ObjectId;                    // Ref: Trip, required
  sender: ObjectId;                  // Ref: User, required
  
  // Content
  content: string;                   // Required
  
  // Timestamp
  createdAt: Date;                   // Default: now
}
```

### PackingItem Model
**Collection:** `packingitems`  
**Location:** `Backend/src/models/PackingItem.model.ts`

```typescript
interface IPackingItem extends Document {
  // Reference
  trip: ObjectId;                    // Ref: Trip, required
  
  // Details
  text: string;                      // Required
  category: string;                  // Default: 'Other'
  isChecked: boolean;                // Default: false
  
  // Creator
  addedBy?: ObjectId;                // Ref: User
  
  // Timestamp
  createdAt: Date;                   // Default: now
}
```

---

## Request/Response Shapes

### Standard Success Response
```typescript
{
  success: boolean;
  data?: any;
  message?: string;
}
```

### Paginated Response
```typescript
{
  success: boolean;
  data: any[];
  total: number;
  page: number;
  limit: number;
  skip: number;
}
```

### Error Response
```typescript
{
  success: false;
  message: string;
  code?: string;
  // Development only:
  stack?: string;
}
```

---

## Error Handling

### Status Codes
- **200**: Success (GET, PUT, DELETE)
- **201**: Created (POST)
- **400**: Bad Request (validation, missing fields)
- **401**: Unauthorized (missing/invalid auth)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error

### Common Error Responses
```typescript
// Missing authentication
{
  message: "Authentication required",
  code: "AUTH_TOKEN_MISSING"
}

// Expired session
{
  message: "Session expired. Please log in again.",
  code: "AUTH_TOKEN_EXPIRED"
}

// Invalid token
{
  message: "Invalid authentication token",
  code: "AUTH_TOKEN_INVALID"
}

// Validation error
{
  message: "Please provide all required fields"
}

// Not found
{
  message: "Resource not found",
  statusCode: 404
}
```

---

## Pagination & Filtering

### Pagination Parameters
All endpoints supporting lists accept:
```typescript
{
  limit?: number;    // Items per page, default varies by endpoint (usually 50)
  skip?: number;     // Offset from start, default 0
  page?: number;     // Alternative to skip (limit × page-1 = skip)
}
```

### Sorting
- **Default**: Descending by date (`createdAt` or `date` field)
- **Customizable**: Most endpoints support `sortBy` parameter
- **Format**: `sortBy=-fieldName` for descending, `sortBy=fieldName` for ascending

### Filtering Examples
```typescript
// By date range
GET /api/settlements/history?startDate=2026-01-01&endDate=2026-03-31

// By category
GET /api/personal-expenses?category=Food

// By status
GET /api/settlements/pending?status=overdue

// By payment method
GET /api/personal-expenses?paymentMethod=UPI

// Combination
GET /api/expenses/group/123?limit=20&skip=0&sortBy=-amount
```

---

## Split Calculation Examples

### Equally Split
```typescript
// 1000 split equally among 3 people
// Each person owes: 1000 / 3 = 333.33
```

### Unequally Split
```typescript
// 1000 split unequally: {userId1: 300, userId2: 700}
splitType: 'unequally'
splitAmounts: {
  "userId1": 300,
  "userId2": 700
}
```

### Percentage Split
```typescript
// 1000 split by percentage: {userId1: 30%, userId2: 70%}
splitType: 'percentage'
splitPercentages: {
  "userId1": 30,
  "userId2": 70
}
// Results: userId1 gets 300, userId2 gets 700
```

### Shares Split
```typescript
// 1000 split by shares: {userId1: 1 share, userId2: 3 shares}
splitType: 'shares'
splitShares: {
  "userId1": 1,
  "userId2": 3
}
// Total shares: 4, Results: userId1 gets 250, userId2 gets 750
```

---

## Currency & Formatting

### Default Currency
- **Currency Code:** INR (₹)
- **UI Format:** `₹XXXX` with locale-specific thousand separators
- **Storage:** Numbers without currency symbol
- **Precision:** 2 decimal places for display, stored as floats

### Amount Storage in Database
- Amounts stored as `Number` type in MongoDB
- Paise calculations used internally for precision in settlement algorithms
- Conversion: `amount * 100 = paise`

---

## Settlement Algorithm Details

### Direct Debt Calculation
1. For each expense, calculate who owes whom based on splits
2. Sum up debts between each pair of people
3. Apply debt netting: If A owes B and B owes A, subtract smaller from larger

### Settlement Optimization
- Minimize number of transactions
- Use creditor/debtor lists sorted by amount
- Greedily match and reduce debts

### Example
```
Expenses:
- Alice paid 1000 for trip (split 3 ways: Alice, Bob, Charlie)
  Bob owes Alice: 333.33
  Charlie owes Alice: 333.33

Result:
- Bob sends 333.33 to Alice
- Charlie sends 333.33 to Alice
(No cycles to eliminate in this case)
```

---

## Notes for Implementation Teams

### Web App (Next.js)
- Use Bearer token from login response for all authenticated requests
- Tokens stored in secure HTTP-only cookies (handled by backend)
- Implement token refresh logic before token expiry
- Handle 401 responses to redirect to login
- All expense amounts should be formatted with currency symbol

### Mobile App (React Native)
- Store tokens securely using `react-native-secure-store` or similar
- Implement automatic token refresh before expiry
- Handle 401 responses gracefully for app navigation
- Support biometric authentication if enabled by user
- All settlement amounts need to be recalculated when members change

### Both Platforms
- Validate splits sum to expense amount before submission
- Implement offline support with local queuing for non-critical updates
- Cache user profile data locally to reduce API calls
- Real-time notifications via WebSocket would enhance UX (not currently implemented)

---

## API Rate Limiting (If Implemented)
Currently no rate limiting is implemented. Recommend adding:
- 100 requests per minute per authenticated user
- 10 requests per minute per IP for unauthenticated endpoints
- Header: `X-RateLimit-Remaining`

---

**End of API Specification Document**
