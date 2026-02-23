# 🚀 GROUP FLOW - Quick Implementation Checklist

**Status:** Ready to Implement  
**Date:** February 23, 2026

---

## ✅ COMPLETED (Frontend Files)

### Type Definitions & Utilities
- [x] `src/types/group.types.ts` - All type definitions, enums, interfaces
- [x] `src/utils/tripDayCalculator.ts` - Trip date calculations & budget logic

### UI Components
- [x] `src/components/groups/GroupTypeSelector.tsx` - 6-card type selector
- [x] `src/components/groups/TripDatePicker.tsx` - Start/End date picker
- [x] `src/components/groups/TimelineTab.tsx` - Day-wise expense breakdown
- [x] `src/components/groups/GroupCard.tsx` - Group listing card

### Documentation
- [x] `GROUP_FLOW_README.md` - Complete implementation guide
- [x] `GROUP_FLOW_CHECKLIST.md` - This file

---

## 📋 TODO - Backend Implementation

### Models (Create in `Backend/src/models/`)

- [ ] **Group.model.ts**
  ```typescript
  // Fields:
  - name: string
  - type: enum 'trip'|'college'|'food'|'flatmates'|'event'|'custom'
  - emoji: string
  - description: string
  - members: [{userId, userName, email, role}]
  - expenses: [ObjectId refs]
  - totalSpent: number
  - netBalance: number
  - isActive: boolean
  - tripStartDate: Date (optional)
  - tripEndDate: Date (optional)
  - tripDestination: string (optional)
  - tripBudget: number (optional)
  - trackBudget: boolean (optional)
  - createdBy: ObjectId
  - createdAt, updatedAt: Date
  ```

- [ ] **Update Expense.model.ts**
  ```typescript
  // Add field:
  - tripDay: number (which day of trip, 1-indexed)
  ```

- [ ] **Update User.model.ts**
  ```typescript
  // Add field:
  - groups: [ObjectId refs to Group]
  ```

### Controllers (Create in `Backend/src/controllers/`)

- [ ] **group.controller.ts**
  - [ ] `createGroup()` - Create new (auto-calculate for trip)
  - [ ] `getAllGroups()` - List user's groups
  - [ ] `getGroupById()` - Get single group + expenses
  - [ ] `updateGroup()` - Update group details
  - [ ] `deleteGroup()` - Archive group
  - [ ] `addExpense()` - Add expense + auto-set tripDay
  - [ ] `removeExpense()` - Remove expense
  - [ ] `getTimeline()` - Get day-wise breakdown
  - [ ] `getSettlements()` - Calculate who owes whom

### Routes (Create in `Backend/src/routes/`)

- [ ] **group.routes.ts**
  ```
  POST   /api/groups/:userId
  GET    /api/groups/:userId
  GET    /api/groups/:groupId
  PUT    /api/groups/:groupId
  DELETE /api/groups/:groupId
  
  POST   /api/groups/:groupId/expenses
  DELETE /api/groups/:groupId/expenses/:expenseId
  GET    /api/groups/:groupId/timeline
  GET    /api/groups/:groupId/settlements
  ```

### Middleware & Utils

- [ ] **Update auth.middleware.ts** - Verify user is group member
- [ ] **Create group.validator.ts** - Input validation
- [ ] **Create trip.calculator.ts** (backend) - Double-check trip day calculation

---

## 📱 TODO - Frontend Screen Implementation

### Navigation & Routes (in `app/`)

- [ ] **Update (tabs) navigation** - Add "Groups" tab or menu item
- [ ] **Create app/group folder** - For all group-related screens

### Screens (Create in `app/group/`)

- [ ] **create.tsx** - Multi-step group creation
  ```
  Step 1: GroupTypeSelector (shows 6 cards)
  Step 2: Dynamic fields based on type
    - If TRIP: Destination, Dates, Budget, TrackBudget toggle
    - If REGULAR: Group name, Emoji, Description
  Step 3: Members selection (multi-select)
  Step 4: Review & Create button
  ```

- [ ] **[id].tsx** - Group detail screen
  ```
  Structure:
  ├─ Header: Group name, emoji, member count
  ├─ Tabs:
  │  ├─ "Expenses" (all groups)
  │  ├─ "Balance" (all groups)
  │  └─ "Timeline" (trip groups only)
  ├─ Tab Content
  └─ FAB: Add Expense
  
  Content:
  - Expenses Tab: List of expenses with details
  - Balance Tab: Settlement info (who owes whom)
  - Timeline Tab: <TimelineTab /> component
  ```

- [ ] **list.tsx** - Groups list screen
  ```
  ├─ Header with "Create Group" button
  ├─ Filter/Sort options
  ├─ <GroupCard /> components in list
  └─ Empty state if no groups
  ```

### Components for Screens

- [ ] **MemberSelector.tsx** - Multi-select with avatars
- [ ] **GroupFormFields.tsx** - Conditional fields based on type
- [ ] **BalanceView.tsx** - Show who owes whom
- [ ] **ExpensesList.tsx** - Render expense items

---

## 🔌 TODO - API Service Integration

- [ ] **Update `src/services/api.ts`**
  ```typescript
  export const apiService = {
    group: {
      create: (userId, data) => api.post(`/groups/${userId}`, data),
      list: (userId) => api.get(`/groups/${userId}`),
      getById: (groupId) => api.get(`/groups/${groupId}`),
      update: (groupId, data) => api.put(`/groups/${groupId}`, data),
      delete: (groupId) => api.delete(`/groups/${groupId}`),
      
      expense: {
        add: (groupId, data) => api.post(`/groups/${groupId}/expenses`, data),
        remove: (groupId, expenseId) => api.delete(`/groups/${groupId}/expenses/${expenseId}`),
        getTimeline: (groupId) => api.get(`/groups/${groupId}/timeline`),
      },
      
      settlement: {
        get: (groupId) => api.get(`/groups/${groupId}/settlements`),
        settle: (groupId, data) => api.post(`/groups/${groupId}/settlements`, data),
      },
    },
  };
  ```

---

## 🧪 TODO - Testing

### Backend Unit Tests
- [ ] `tripDayCalculator.test.ts` - Test all utility functions
- [ ] `group.controller.test.ts` - Test all handlers

### Frontend Unit Tests
- [ ] `GroupTypeSelector.test.tsx` - Type selection logic
- [ ] `tripDayCalculator.test.ts` - Calculation accuracy
- [ ] `TimelineTab.test.tsx` - Timeline rendering

### Integration Tests
- [ ] **Create Trip Group Flow**
  - [ ] Open create screen
  - [ ] Select Trip type
  - [ ] Fill all trip fields
  - [ ] Add members
  - [ ] Verify group created
  - [ ] Verify in list with correct info

- [ ] **Add Expense to Trip**
  - [ ] Open trip group
  - [ ] Add expense with date
  - [ ] Verify tripDay calculated
  - [ ] Verify appears in correct day in Timeline

- [ ] **Budget Tracking**
  - [ ] Create trip with ₹50,000 budget, trackBudget=true
  - [ ] Add expenses totaling <40,000
  - [ ] Verify no warning
  - [ ] Add to >40,000
  - [ ] Verify warning appears
  - [ ] Add to >50,000
  - [ ] Verify exceeded alert

### Manual Testing (QA)
- [ ] Group creation flow (all 6 types)
- [ ] Timeline display for trip groups
- [ ] Budget warning/alert logic
- [ ] Responsive design (mobile, tablet)
- [ ] Error handling (failed API calls)
- [ ] Edge cases (0 members, past dates, etc.)

---

## 📦 TODO - Deployment

### Pre-Deployment Checklist

**Backend:**
- [ ] All models created and tested
- [ ] All routes implemented
- [ ] All controllers working
- [ ] Input validation in place
- [ ] Error handling comprehensive
- [ ] Database migrations done
- [ ] .env variables configured
- [ ] Build successful: `npm run build`

**Frontend:**
- [ ] All screens created
- [ ] All components integrated
- [ ] API calls tested
- [ ] Loading states added
- [ ] Error messages displayed
- [ ] TypeScript compile without errors
- [ ] No console warnings
- [ ] Expo build successful

### Deployment Steps

1. **Backend Deployment**
   ```bash
   # Push to production branch
   git push origin main
   
   # Deploy to Render/Railway/Heroku
   # Verify DB migrations ran
   # Test API endpoints
   ```

2. **Mobile App Deployment**
   ```bash
   # iOS
   eas build --platform ios --distribution appstore
   
   # Android
   eas build --platform android --distribution playstore
   
   # Expo OTA
   eas update
   ```

---

## 📊 File Structure Summary

```
Mobile-App/
├── src/
│   ├── types/
│   │   └── group.types.ts ✅
│   ├── utils/
│   │   └── tripDayCalculator.ts ✅
│   ├── components/
│   │   └── groups/
│   │       ├── GroupTypeSelector.tsx ✅
│   │       ├── TripDatePicker.tsx ✅
│   │       ├── TimelineTab.tsx ✅
│   │       ├── GroupCard.tsx ✅
│   │       ├── MemberSelector.tsx ⏳
│   │       ├── GroupFormFields.tsx ⏳
│   │       ├── BalanceView.tsx ⏳
│   │       └── ExpensesList.tsx ⏳
│   └── services/
│       └── api.ts (add group endpoints) ⏳
├── app/
│   └── group/
│       ├── create.tsx ⏳
│       ├── [id].tsx ⏳
│       └── list.tsx ⏳
└── GROUP_FLOW_README.md ✅

Backend/
├── src/
│   ├── models/
│   │   ├── Group.model.ts ⏳
│   │   ├── Expense.model.ts (update) ⏳
│   │   └── User.model.ts (update) ⏳
│   ├── controllers/
│   │   └── group.controller.ts ⏳
│   ├── routes/
│   │   └── group.routes.ts ⏳
│   └── middleware/
│       └── (updates as needed) ⏳
└── tests/
    ├── group.test.ts ⏳
    └── tripCalculator.test.ts ⏳
```

---

## 🎯 Priority Order

**High Priority (Start Here):**
1. Backend models (Group, update Expense/User)
2. Backend controllers & routes
3. Screen: `app/group/create.tsx`
4. Screen: `app/group/[id].tsx`
5. API service integration

**Medium Priority (Next):**
6. Additional UI components (MemberSelector, etc.)
7. Screen: `app/group/list.tsx`
8. Backend validation & error handling
9. Unit tests

**Low Priority (Polish)**
10. Integration tests
11. Animations & transitions
12. Accessibility improvements
13. Performance optimization

---

## 📞 Quick Reference

| Component | Purpose | Location |
|-----------|---------|----------|
| Input state | Group type | `create.tsx` state |
| Calculate day | When adding expense | `tripDayCalculator.ts` → auto in API |
| Show timeline | Trip group detail | `[id].tsx` → use `<TimelineTab />` |
| Format dates | Trip card display | `tripDayCalculator.ts` → `formatTripSummary()` |
| Budget status | Show progress | `tripDayCalculator.ts` → `getTripBudgetStatus()` |

---

## 🎉 Completion Criteria

✅ **FEATURE COMPLETE when:**
1. All 6 screens working end-to-end
2. Trip groups show timeline with day-wise expenses
3. Budget tracking works with warnings
4. All expenses auto-tagged with correct trip day
5. Regular groups work without trip features
6. Responsive on all device sizes
7. All API calls working
8. Error handling implemented
9. Unit & integration tests passing
10. Ready for production deployment

---

**Last Updated:** February 23, 2026  
**Next Review:** After backend implementation  
**Owner:** Development Team
