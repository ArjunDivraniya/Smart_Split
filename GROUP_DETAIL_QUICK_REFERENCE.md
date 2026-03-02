# Group Detail - Quick Reference Guide

## 🎯 4-Tab Architecture Overview

```
┌─────────────────────────────────────────┐
│         Group Detail Screen             │
├─────────┬─────────┬──────────┬──────────┤
│ Expenses│ Balances│ Timeline │ Summary  │
└─────────┴─────────┴──────────┴──────────┘
```

---

## 📍 API Endpoints Reference

### Expenses
```
GET /api/expenses/group/:id
Query params:
  - paid: "userId" | "!userId" | undefined
  - category: "Food" | "Transport" | ...
  - search: string
  - sortBy: "date" | "amount"
  - sortOrder: "asc" | "desc"
```

### Balances
```
GET /api/expenses/group/:id/balances
Returns: Array<{
  userId: string,
  userName: string,
  netBalance: number,
  paid: number,
  owedShare: number
}>
```

### Settlements
```
GET /api/groups/:id/settlements
Returns: {
  optimizedSettlements: Array<{ from, to, amount }>,
  balanceRows: Array<Balance>,
  settlements: Array<Settlement>
}

POST /api/groups/:id/settlements
Body: {
  fromUserId: string,
  toUserId: string,
  amount: number,
  note?: string
}
```

### Summary
```
GET /api/groups/:id/summary
Returns: {
  totalExpenses: number,
  totalAmount: number,
  categoryBreakdown: Array<{
    category: string,
    amount: number,
    count: number,
    percentage: number
  }>,
  memberContributions: Array<{
    userId: string,
    userName: string,
    totalPaid: number,
    percentage: number
  }>
}
```

### Timeline
```
GET /api/groups/:id/timeline
Returns: {
  timeline: Array<{
    date: string,
    expenses: Array<Expense>,
    totalAmount: number
  }>
}
```

---

## 📱 Component Props Reference

### ExpensesTab
```typescript
interface ExpensesTabProps {
  groupId: string;
  currentUserId: string;
  onAddExpense: () => void;
}
```

### BalancesTab
```typescript
interface BalancesTabProps {
  groupId: string;
  currentUserId: string;
  currentUserName: string;
}
```

### TimelineTab
```typescript
interface TimelineTabProps {
  groupId: string;
  currentUserId: string;
}
```

### SummaryTab
```typescript
interface SummaryTabProps {
  groupId: string;
  currentUserId: string;
}
```

---

## 🎨 Color Coding Reference

### Categories
- **Food**: #f59e0b (Orange)
- **Transport**: #3b82f6 (Blue)
- **Accommodation**: #8b5cf6 (Purple)
- **Entertainment**: #ec4899 (Pink)
- **Shopping**: #10b981 (Green)
- **Other**: #6366f1 (Indigo)

### Balances
- **Positive (owed to you)**: #22c55e (Green)
- **Negative (you owe)**: #ef4444 (Red)
- **Settled**: #94a3b8 (Gray)
- **Primary**: #6366f1 (Indigo)

---

## 🔧 Quick Debug Commands

### Backend
```bash
# Check TypeScript errors
cd Backend
npx tsc --noEmit

# Start dev server
npm run dev

# Check specific route
curl http://localhost:5000/api/groups/:id/summary
```

### Mobile
```bash
# Check mobile app
cd Mobile-App
npm start

# Type check
npx tsc --noEmit
```

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot find module '@/components/ExpensesTab'"
**Fix:** Check import paths - should be `@/components/ExpensesTab` not `@/src/components/`

### Issue: "currentUserId is empty"
**Fix:** Ensure `loadCurrentUser()` completes before rendering tabs

### Issue: "Network request failed"
**Fix:** Check backend is running on port 5000 and API_URL is correct

### Issue: "Optimized settlements not showing"
**Fix:** Ensure at least 2 users have non-zero balances

---

## 📊 Algorithm Examples

### Balance Calculation
```
User A paid: ₹1000
User A owes:  ₹500
User A net:   ₹500 (gets back)

User B paid: ₹200
User B owes:  ₹500
User B net:  -₹300 (owes)
```

### Settlement Optimization
```
Before optimization:
- A owes B: ₹100
- A owes C: ₹200
- B owes C: ₹50

After optimization: (2 transactions)
- A owes C: ₹250
- B owes C: ₹50

Saved 1 transaction!
```

---

## 🎯 Feature Flags

Toggle features with simple boolean checks:

```typescript
// In component
const ENABLE_RECEIPT_UPLOAD = false;
const ENABLE_EXPENSE_CATEGORIES_CUSTOM = false;
const ENABLE_SETTLEMENT_REMINDERS = false;

{ENABLE_RECEIPT_UPLOAD && (
  <ReceiptUploadButton />
)}
```

---

## 📁 File Locations

### Backend Controllers
- Expenses: `Backend/src/controllers/expense.controller.ts`
- Groups: `Backend/src/controllers/group.controller.ts`

### Backend Routes
- Expenses: `Backend/src/routes/expense.routes.ts`
- Groups: `Backend/src/routes/group.routes.ts`
- Settlements: `Backend/src/routes/settlement.routes.ts`

### Mobile Components
- Tabs: `Mobile-App/components/*Tab.tsx`
- Supporting: `Mobile-App/components/ExpenseItem.tsx`, `BalanceRow.tsx`, `SettlementModal.tsx`
- Main: `Mobile-App/app/group/[id].tsx`

### API Service
- `Mobile-App/src/services/api.ts`

---

## 🚀 Quick Start Testing

1. **Start Backend**
   ```bash
   cd Backend
   npm run dev
   ```

2. **Start Mobile**
   ```bash
   cd Mobile-App
   npm start
   ```

3. **Create Test Data**
   - Create a group with 3+ members
   - Add 5-10 expenses with different categories
   - Have different people pay

4. **Test Flow**
   - Open group detail
   - Switch to each tab
   - Test filters in Expenses tab
   - Record a settlement in Balances tab
   - View timeline
   - Check summary charts

---

## 📈 Performance Tips

- Tabs lazy-load their data (fetch on tab switch)
- Pull-to-refresh updates current tab only
- Images/receipts use lazy loading
- Lists use FlatList for virtualization
- Modal uses keyboard avoidance

---

## ✅ Pre-Deployment Checklist

- [ ] All TypeScript errors resolved
- [ ] Backend starts without errors
- [ ] Mobile app builds successfully
- [ ] All tabs render without crashes
- [ ] Filters work correctly
- [ ] Settlement recording works
- [ ] Charts display data
- [ ] Empty states show properly
- [ ] Loading states appear
- [ ] Error handling works
- [ ] Pull-to-refresh updates data
- [ ] Tab switching is smooth

---

*Last Updated: Today*
*Version: 1.0.0*
