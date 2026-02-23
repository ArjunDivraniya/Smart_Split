# 🎯 GROUP FLOW - Complete Implementation Guide

**Version:** 1.0.0  
**Status:** ✅ Ready for Implementation  
**Last Updated:** February 23, 2026

---

## 📋 Table of Contents

1. [Feature Overview](#feature-overview)
2. [Architecture & Flow](#architecture--flow)
3. [File Structure](#file-structure)
4. [Component Documentation](#component-documentation)
5. [Type Definitions](#type-definitions)
6. [API Integration](#api-integration)
7. [Usage Examples](#usage-examples)
8. [Implementation Steps](#implementation-steps)
9. [Testing Guide](#testing-guide)

---

## 🎯 Feature Overview

The GROUP FLOW feature provides an intelligent, user-friendly way to create and manage shared expense groups with special support for trip planning.

### Key Features

#### 🟣 STEP 1 — Visual Group Type Selection
Instead of dropdowns, users select from **6 group types** displayed as interactive cards:

- ✈️ **Trip** - Travel and vacation expenses
- 🎓 **College** - Shared college group
- 🍔 **Food & Snacks** - Food sharing expenses
- 🏠 **Flatmates** - Shared living expenses
- 🎉 **Event** - Event or party expenses
- ➕ **Custom** - Create your own type

Each card shows:
- Large emoji icon
- Group type label
- Description text
- Checkmark when selected

#### 🟣 STEP 2 — Dynamic Fields
Based on group type selection, different fields are shown:

**If TRIP is selected:**
- 📍 Destination (text input)
- 📅 Start Date (date picker)
- 📅 End Date (date picker)
- 💰 Trip Budget (amount input)
- 🔔 Track Budget (toggle) - **NEW**
- Optional: Description

**If REGULAR (non-trip) is selected:**
- Group Name (text input)
- Emoji/Icon selector
- Members (multi-select)
- Optional: Description

#### 🟣 STEP 3 — Smart Budget Tracking (Trip Only)
When "Track Budget" toggle is ON:
- ✅ Budget progress bar in group card
- ✅ Budget status in Timeline tab
- ⚠️ Warning when > 80% spent
- 🔴 Alert when budget exceeded
- 📊 Live spending breakdown by day

---

## 🏗️ Architecture & Flow

### User Flow Diagram

```
User Opens Group Creation
        ↓
   STEP 1: Select Type
        ↓
     If TRIP?
   ↙ YES → Trip Fields   NO → Regular Fields ↘
   ↓                                        ↓
   ├─ Destination                          ├─ Group Name
   ├─ Start Date                           ├─ Emoji
   ├─ End Date                             ├─ Members
   ├─ Budget                               └─ Description
   ├─ Track Budget?
   └─ Description
        ↓
   STEP 2: Fill in Details
        ↓
   STEP 3: Add Members
        ↓
   STEP 4: Create Group
        ↓
   Group Created Successfully
```

### Data Flow for Trip Groups

```
Trip Created with Dates + Budget
        ↓
User Adds Expense with Date
        ↓
App Calculates Trip Day:
├─ Day 1 = Trip Start Date
├─ Day 2 = Start Date + 1 day
└─ Day N = Start Date + (N-1) days
        ↓
Expense Tagged with Day Number
        ↓
Timeline Tab Shows:
├─ Day-wise expense breakdown
├─ Daily spending totals
├─ Budget progress bar
└─ Warning/Alert if over budget
```

---

## 📁 File Structure

### Core Types & Utilities
```
src/types/
└── group.types.ts                    # All group-related type definitions
    ├── GroupType enum
    ├── Group interface
    ├── Expense interface
    ├── TripDay interface
    └── CreateGroupFormData interface

src/utils/
└── tripDayCalculator.ts              # Trip date & budget calculations
    ├── calculateTripDay()
    ├── getTripDuration()
    ├── generateTripDays()
    ├── getTripBudgetStatus()
    ├── formatTripDateRange()
    └── formatTripSummary()
```

### UI Components
```
src/components/groups/
├── GroupTypeSelector.tsx             # Step 1: Type selection (6 cards)
│   └── Shows all 6 group types with icons & descriptions
│
├── TripDatePicker.tsx                # Start/End date picker
│   ├── iOS modal picker
│   ├── Android inline picker
│   └── Auto-calculates trip duration
│
├── TimelineTab.tsx                   # Trip expenses by day
│   ├── Day-wise expense breakdown
│   ├── Budget progress visualization
│   ├── Budget warnings
│   └── Expense details per day
│
└── GroupCard.tsx                     # Group listing card
    ├── Different layout for Trip vs Regular
    ├── Shows dates & destination for trips
    ├── Budget bar for trip groups
    └── Total spent & net balance
```

### Screen Files (To Create)
```
app/group/
├── create.tsx                         # Group creation flow
│   ├── Step 1: Type selection
│   ├── Step 2: Dynamic fields based on type
│   ├── Step 3: Members selection
│   └── Step 4: Review & create
│
├── [id].tsx                           # Group detail screen
│   ├── Header with group info
│   ├── Tabs: Expenses | Balance | (Timeline for trips only)
│   ├── Dynamic tabs based on type
│   └── Add expense button
│
└── list.tsx                           # Groups list screen
    └── GroupCard components (sorted chronologically or by type)
```

---

## 🧩 Component Documentation

### 1. GroupTypeSelector

**Purpose:** Allow user to visually select group type in Step 1

**Props:**
```typescript
interface GroupTypeSelectorProps {
  selectedType: GroupType | null;
  onSelectType: (type: GroupType) => void;
}
```

**Features:**
- 6 interactive cards in 2x3 grid
- Visual feedback on selection
- Info box explaining selected type
- Touch feedback with opacity

**Usage:**
```typescript
const [selectedType, setSelectedType] = useState<GroupType | null>(null);

<GroupTypeSelector
  selectedType={selectedType}
  onSelectType={setSelectedType}
/>

// Now show dynamic fields based on selectedType
{selectedType === GroupType.TRIP && (
  <>
    <TripDatePicker {...} />
    {/* Trip specific fields */}
  </>
)}
```

---

### 2. TripDatePicker

**Purpose:** Select trip start and end dates with validation

**Props:**
```typescript
interface TripDatePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}
```

**Features:**
- Separate start/end date buttons
- iOS: Modal picker (Syne font, smooth animation)
- Android: Native date picker
- Auto-calculates duration
- Validation: (end >= start)
- Visual feedback: Duration box

**Usage:**
```typescript
const [startDate, setStartDate] = useState<Date | null>(null);
const [endDate, setEndDate] = useState<Date | null>(null);

<TripDatePicker
  startDate={startDate}
  endDate={endDate}
  onStartDateChange={setStartDate}
  onEndDateChange={setEndDate}
/>
```

---

### 3. TimelineTab

**Purpose:** Display trip expenses organized by day with budget tracking

**Props:**
```typescript
interface TimelineTabProps {
  group: Group;
  expenses: any[];
  onExpenseTap?: (expenseId: string) => void;
}
```

**Features:**
- 📊 Budget status box (if trackBudget = true)
- 📅 Day-by-day expense breakdown
- 💰 Daily totals
- 🔔 Budget warnings (>80% or exceeded)
- Performance optimized with useMemo

**Budget Status Display:**
```
┌─ Trip Budget: ₹30,000 ─────────────┐
│ Progress: █████░░░░░ 55%            │
│ Spent: ₹16,500  |  Remaining: ₹13,500  │
│ Usage: 55%                          │
└─────────────────────────────────────┘
```

**Day Display:**
```
📅 Day 1: Friday, Jan 15
├─ 🏨 Hotel - Paid by Arjun - ₹4,200
├─ 🍔 Dinner - Paid by Rahul - ₹1,800
└─ Total: ₹6,000

📅 Day 2: Saturday, Jan 16
├─ 🏖️ Beach ride - Paid by Arjun - ₹600
└─ Total: ₹600
```

---

### 4. GroupCard

**Purpose:** Display group info in list with different layouts for trip vs regular

**Props:**
```typescript
interface GroupCardProps {
  group: Group;
  onPress: () => void;
  onLongPress?: () => void;
}
```

**Regular Group Card:**
```
🎓 College Snacks
5 members · Active
─────────────────
Total Spent: ₹2,400
You Get: ₹350
```

**Trip Group Card:**
```
✈️ Goa Trip 2025
Jan 15–18 · 4 days
📍 Mumbai → Goa
─────────────────
Total Spent: ₹16,500
You Owe: ₹600
[Budget: 55% of ₹30,000]
```

---

## 📘 Type Definitions

### GroupType Enum
```typescript
enum GroupType {
  TRIP = 'trip',
  COLLEGE = 'college',
  FOOD = 'food',
  FLATMATES = 'flatmates',
  EVENT = 'event',
  CUSTOM = 'custom',
}
```

### Group Interface
```typescript
interface Group {
  id: string;
  name: string;
  type: GroupType;
  emoji?: string;
  description?: string;
  
  members: Array<{
    userId: string;
    userName: string;
    email: string;
    role: 'creator' | 'member';
  }>;
  
  expenses: Expense[];
  totalSpent: number;
  netBalance: number;
  isActive: boolean;
  
  // Trip-specific fields
  tripStartDate?: Date;
  tripEndDate?: Date;
  tripDestination?: string;
  tripBudget?: number;
  trackBudget?: boolean;  // NEW: Budget tracking toggle
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### TripDay Interface
```typescript
interface TripDay {
  dayNumber: number;           // 1, 2, 3...
  date: Date;                  // Actual date
  dayName: string;             // "Monday, Jan 15"
  expenses: Expense[];
  totalSpent: number;
}
```

### Expense Interface
```typescript
interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  paidBy: string;              // User ID
  paidByName: string;
  splitAmong: Array<{
    userId: string;
    userName: string;
    amount: number;
  }>;
  date: Date;
  groupId: string;
  
  // Trip-specific
  tripDay?: number;            // Which day of trip (1, 2, 3...)
  
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔌 API Integration

### Backend Models Required

#### User Model Update
```typescript
// Already done in previous implementation
// No changes needed
```

#### Group Model
```typescript
// Backend/src/models/Group.model.ts

const groupSchema = new Schema({
  name: String,
  type: {
    type: String,
    enum: ['trip', 'college', 'food', 'flatmates', 'event', 'custom'],
  },
  emoji: String,
  description: String,
  
  members: [{
    userId: Schema.Types.ObjectId,
    userName: String,
    email: String,
    role: { type: String, enum: ['creator', 'member'] },
  }],
  
  expenses: [{ type: Schema.Types.ObjectId, ref: 'Expense' }],
  totalSpent: Number,
  netBalance: Number,
  isActive: Boolean,
  
  // Trip-specific
  tripStartDate: Date,
  tripEndDate: Date,
  tripDestination: String,
  tripBudget: Number,
  trackBudget: Boolean,  // NEW
  
  createdBy: Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

#### Expense Model
```typescript
// Backend/src/models/Expense.model.ts

const expenseSchema = new Schema({
  amount: Number,
  description: String,
  category: String,
  paidBy: Schema.Types.ObjectId,
  paidByName: String,
  
  splitAmong: [{
    userId: Schema.Types.ObjectId,
    userName: String,
    amount: Number,
  }],
  
  date: Date,
  groupId: Schema.Types.ObjectId,
  tripDay: Number,  // NEW: Which day of trip
  
  attachments: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

### API Endpoints

```
POST /api/groups
├── Create new group
├── Body: { name, type, emoji, description, members[], tripStartDate?, tripEndDate?, tripDestination?, tripBudget?, trackBudget? }
└── Returns: Group object

GET /api/groups
├── List all user's groups
└── Returns: Group[]

GET /api/groups/:groupId
├── Get group details
└── Returns: Group + Expense[]

PUT /api/groups/:groupId
├── Update group
├── Body: { name, emoji, description, trackBudget?, ... }
└── Returns: Updated Group

DELETE /api/groups/:groupId
├── Delete/archive group
└── Returns: { success: true }

POST /api/groups/:groupId/expenses
├── Add expense to group
├── Body: { amount, description, category, paidBy, splitAmong[], date }
└── Returns: Expense (with tripDay auto-calculated)

GET /api/groups/:groupId/timeline
├── Get day-wise expense breakdown for trip
├── Query: ?startDate=...&endDate=...
└── Returns: TripDay[]
```

### Service Layer Integration

```typescript
// src/services/api.ts

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

export const apiService = {
  group: {
    create: (data) => api.post('/groups', data),
    list: () => api.get('/groups'),
    getById: (id) => api.get(`/groups/${id}`),
    update: (id, data) => api.put(`/groups/${id}`, data),
    delete: (id) => api.delete(`/groups/${id}`),
    
    expense: {
      add: (groupId, data) => api.post(`/groups/${groupId}/expenses`, data),
      getTimeline: (groupId, params) => api.get(`/groups/${groupId}/timeline`, { params }),
    },
  },
};
```

---

## 💡 Usage Examples

### Example 1: Create a Trip Group

```typescript
import { GroupType } from '@/src/types/group.types';
import { apiService } from '@/src/services/api';

const createTripGroup = async () => {
  const groupData = {
    name: 'Goa Trip 2025',
    type: GroupType.TRIP,
    emoji: '✈️',
    description: 'Beach trip with friends',
    tripStartDate: new Date('2025-01-15'),
    tripEndDate: new Date('2025-01-18'),
    tripDestination: 'Goa, India',
    tripBudget: 30000,
    trackBudget: true,  // Enable budget tracking
    members: ['userId1', 'userId2', 'userId3'],
  };

  try {
    const response = await apiService.group.create(groupData);
    console.log('Group created:', response.data);
  } catch (error) {
    console.error('Failed to create group:', error);
  }
};
```

### Example 2: Calculate Trip Days for Display

```typescript
import { generateTripDays } from '@/src/utils/tripDayCalculator';

const group: Group = { /* group data */ };
const expenses: Expense[] = [ /* expenses array */ ];

const tripDays = generateTripDays(group, expenses);

// Output:
// [
//   {
//     dayNumber: 1,
//     date: Date(2025-01-15),
//     dayName: 'Tuesday, Jan 15',
//     expenses: [...],
//     totalSpent: 6000,
//   },
//   {
//     dayNumber: 2,
//     date: Date(2025-01-16),
//     dayName: 'Wednesday, Jan 16',
//     expenses: [...],
//     totalSpent: 600,
//   },
// ]
```

### Example 3: Check Budget Status

```typescript
import { getTripBudgetStatus } from '@/src/utils/tripDayCalculator';

const budgetStatus = getTripBudgetStatus(30000, 16500);

console.log(budgetStatus);
// {
//   spent: 16500,
//   remaining: 13500,
//   percentage: 55,
//   status: 'safe'
// }

if (budgetStatus.status === 'warning') {
  // Show warning alert
}
```

### Example 4: Add Expense to Trip Group

```typescript
import { calculateTripDay } from '@/src/utils/tripDayCalculator';

const expenseDate = new Date('2025-01-16'); // Day 2 of trip
const tripDay = calculateTripDay(
  expenseDate,
  group.tripStartDate,
  group.tripEndDate
); // Returns: 2

const expenseData = {
  amount: 600,
  description: 'Beach ride',
  category: 'Transportation',
  paidBy: currentUserId,
  splitAmong: [
    { userId: user1Id, userName: 'Arjun', amount: 300 },
    { userId: user2Id, userName: 'Rahul', amount: 300 },
  ],
  date: expenseDate,
  // tripDay is auto-calculated on backend
};

const response = await apiService.group.expense.add(groupId, expenseData);
```

### Example 5: Display Timeline for Trip Group

```typescript
<ScrollView>
  {tripDays.map((day) => (
    <View key={day.dayNumber}>
      <Text>📅 Day {day.dayNumber}: {day.dayName}</Text>
      
      {day.expenses.map((exp) => (
        <View>
          <Text>{exp.description}</Text>
          <Text>₹{exp.amount}</Text>
        </View>
      ))}
      
      <Text>Total: ₹{day.totalSpent}</Text>
    </View>
  ))}
</ScrollView>
```

---

## 🛠️ Implementation Steps

### Phase 1: Backend Setup (1-2 days)

1. **Create Group Model**
   - File: `Backend/src/models/Group.model.ts`
   - Include all fields from type definitions
   - Add validators

2. **Create Expense Model**
   - File: `Backend/src/models/Expense.model.ts`
   - Add tripDay field
   - Add proper indexes for querying

3. **Create Group Controller**
   - File: `Backend/src/controllers/group.controller.ts`
   - Methods: create, list, getById, update, delete
   - Auto-calculate tripDay in expense handler

4. **Create Group Routes**
   - File: `Backend/src/routes/group.routes.ts`
   - All CRUD endpoints
   - Auth middleware on all routes

5. **Update User Model**
   - Add groups: [Schema.Types.ObjectId] array
   - Index for quick lookups

### Phase 2: Frontend Components (2-3 days)

1. **✅ Create Type Definitions**
   - File: `src/types/group.types.ts` (DONE)

2. **✅ Create Utility Functions**
   - File: `src/utils/tripDayCalculator.ts` (DONE)

3. **✅ Create UI Components**
   - `GroupTypeSelector.tsx` (DONE)
   - `TripDatePicker.tsx` (DONE)
   - `TimelineTab.tsx` (DONE)
   - `GroupCard.tsx` (DONE)

4. **Create Screen Files**
   - `app/group/create.tsx` - Multi-step form
   - `app/group/[id].tsx` - Group detail with tabs
   - `app/group/list.tsx` - Groups listing

5. **Update API Service**
   - Add group endpoints to `src/services/api.ts`

### Phase 3: Integration & Testing (1-2 days)

1. Connect screens to API
2. Test group creation with both types
3. Test trip timeline display
4. Test budget tracking
5. Test expense adding with auto-day calculation

### Phase 4: Polish & Deploy (1 day)

1. Add animations & transitions
2. Error handling & validation
3. Loading states
4. Deploy backend
5. Deploy mobile app

---

## 🧪 Testing Guide

### Unit Tests

```typescript
// Test: Calculate trip day
describe('calculateTripDay', () => {
  it('should return day 1 for start date', () => {
    const day = calculateTripDay(
      new Date('2025-01-15'),
      new Date('2025-01-15'),
      new Date('2025-01-18')
    );
    expect(day).toBe(1);
  });

  it('should return day 3 for correct date', () => {
    const day = calculateTripDay(
      new Date('2025-01-17'),
      new Date('2025-01-15'),
      new Date('2025-01-18')
    );
    expect(day).toBe(3);
  });
});

// Test: Budget status
describe('getTripBudgetStatus', () => {
  it('should return safe status for low spending', () => {
    const status = getTripBudgetStatus(30000, 10000);
    expect(status.status).toBe('safe');
  });

  it('should return warning for >80% spending', () => {
    const status = getTripBudgetStatus(30000, 25000);
    expect(status.status).toBe('warning');
  });

  it('should return exceeded for >100% spending', () => {
    const status = getTripBudgetStatus(30000, 35000);
    expect(status.status).toBe('exceeded');
  });
});
```

### Manual Tests

#### Test 1: Create Regular Group
1. Open group creation
2. Select "College" type
3. Enter name: "Computer Science 2024"
4. Select 5 members
5. Create
6. ✅ Verify group appears in list as regular card (no dates shown)

#### Test 2: Create Trip Group with Budget
1. Open group creation
2. Select "Trip" type
3. Enter destination: "Singapore"
4. Select dates: Jan 20 - Jan 25 (6 days)
5. Enter budget: ₹50,000
6. Toggle "Track Budget" ON
7. Add 4 members
8. Create
9. ✅ Verify:
   - Trip card shows dates & destination
   - Budget bar visible
   - Timeline tab available

#### Test 3: Add Expense to Trip
1. Go to trip group detail
2. Click "Add Expense"
3. Add: ₹4,000 for hotel on Jan 21
4. Submit
5. ✅ Verify:
   - Expense appears in Timeline > Day 2
   - Budget progress updates
   - Daily total shows ₹4,000

#### Test 4: Budget Warning
1. Add multiple expenses totaling ₹40,000+ (80% of ₹50,000 budget)
2. ✅ Verify warning box appears in Timeline
3. Continue adding until ₹50,000+ (over budget)
4. ✅ Verify red exceeded alert appears

#### Test 5: Responsive Design
1. Test on different screen sizes
2. Verify text doesn't overflow
3. Verify buttons are tappable (min 44x44pt)
4. Test landscape orientation

---

## 📊 Summary Table

| Feature | Regular Groups | Trip Groups |
|---------|---|---|
| Type Selection | 5 options | 6 options |
| Fields | Name, Members | + Dates, Destination, Budget |
| Budget Tracking | ❌ No | ✅ Yes (optional) |
| Timeline View | ❌ No | ✅ Yes (day-wise) |
| Duration Display | ❌ No | ✅ Yes |
| Budget Warnings | ❌ No | ✅ Yes (>80%, >100%) |
| Card Display | Simple | Detailed with dates |

---

## 🚀 Next Steps

1. Review all components created
2. Understand type definitions
3. Implement backend models & routes
4. Create screen files (create.tsx, [id].tsx, list.tsx)
5. Connect to API endpoints
6. Test comprehensively
7. Deploy!

---

**Happy coding! 🎉**  
For questions or clarifications, refer to specific section in this guide.
