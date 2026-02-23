# 🎯 GROUP FLOW - Visual UI Reference & Implementation Summary

**Version:** 1.0 - Ready for Development  
**Date:** February 23, 2026  
**Status:** ✅ All Frontend Components Created

---

## 📐 UI/UX Design Overview

### Design System (from smartsplit-ui-guide.html)

**Colors Used:**
```
Background: #0F0F1A (void/dark)
Surfaces: #1A1A2B (elevated)
Primary: #7C5CFC (violet)
Accent: #00E5B0 (mint)
Warning: #FFB547 (amber)
Danger: #FF5F7E (coral)
Text Primary: #F0F0FF
Text Secondary: #8888AA
Text Muted: #55556A
```

**Typography:**
```
Display Font: Syne (800ExtraBold for headings)
Body Font: DM Sans (400Regular for text)
```

**Components:**
```
Border Radius: 12-16px (rounded cards)
Touch Target: 44x44pt minimum
Icons: Ionicons
```

---

## 🎨 Step-by-Step UI Flow

### STEP 1: Group Type Selection
```
╔════════════════════════════════════════════╗
║           Create a new group              ║
╠════════════════════════════════════════════╣
║                                             │
║  Choose Group Type                          │
│  Select the type that best fits your group  │
║                                             ║
║  ┌─────────────┐  ┌─────────────┐          ║
║  │    ✈️       │  │    🎓       │          ║
║  │   Trip      │  │  College    │          ║
║  │ Vacation    │  │   Shared    │          ║
║  │ expenses    │  │   college   │          ║
║  └─────────────┘  └─────────────┘          ║
║                                             ║
║  ┌─────────────┐  ┌─────────────┐          ║
║  │    🍔       │  │    🏠       │          ║
║  │  Food &     │  │ Flatmates   │          ║
║  │  Snacks     │  │  Shared     │          ║
║  │ Sharing     │  │  living     │          ║
║  └─────────────┘  └─────────────┘          ║
║                                             ║
║  ┌─────────────┐  ┌─────────────┐          ║
║  │    🎉       │  │    ➕       │          ║
║  │   Event     │  │   Custom    │          ║
║  │  Party      │  │   Create    │          ║
║  │ expenses    │  │   your own  │          ║
║  └─────────────┘  └─────────────┘          ║
║                                             ║
║  ℹ️ Trip groups include special trip       ║
║     tracking with daily expense timeline   ║
║     and budget monitoring.                 ║
║                                             ║
╚════════════════════════════════════════════╝
```

**Component:** `GroupTypeSelector.tsx`
- 6 selectable cards in 2x3 grid
- Emoji, label, description on each
- ✓ Checkmark on selection
- Info box shows selected type details

---

### STEP 2: Dynamic Fields (Trip Branch)

```
If TRIP Selected:

╔════════════════════════════════════════════╗
║        Trip Details                       ║
╠════════════════════════════════════════════╣
║                                             │
║  Group Name *                               │
║  ┌────────────────────────────────────┐    ║
║  │ Goa Trip 2025                      │ ✓  ║
║  └────────────────────────────────────┘    ║
║                                             ║
║  📍 Destination *                           ║
║  ┌────────────────────────────────────┐    ║
║  │ Goa, India                         │ 🌍 ║
║  └────────────────────────────────────┘    ║
║                                             ║
║  📅 Trip Duration *                        ║
║  ┌────────────────┐  ➜  ┌──────────────┐  ║
║  │ Jan 15, 2025   │     │ Jan 18, 2025 │  ║
║  │ Friday         │     │ Monday       │  ║
║  └────────────────┘     └──────────────┘  ║
║        Jan 15–18 · 4 days                  ║
║                                             ║
║  💰 Trip Budget *                          ║
║  ┌────────────────────────────────────┐    ║
║  │ ₹30,000                            │    ║
║  └────────────────────────────────────┘    ║
║                                             ║
║  📊 Track Budget Progress                  ║
║  ┌─────────────────────────────────┐       ║
║  │ OFF    ●─────────────  ON       │ ✓     ║
║  └─────────────────────────────────┘       ║
║  Show real-time budget tracking within     ║
║  the group with warnings when >80% spent   ║
║                                             ║
║  📝 Description (optional)                 ║
║  ┌────────────────────────────────────┐    ║
║  │ Beach trip with college friends    │    ║
║  └────────────────────────────────────┘    ║
║                                             ║
║                  [  Next  ]                 ║
║                                             ║
╚════════════════════════════════════════════╝

Components Used:
- TextInput for name, destination, description
- TripDatePicker for start/end dates
- Amount picker for budget
- Toggle for Track Budget
```

### STEP 2: Dynamic Fields (Regular Branch)

```
If NON-TRIP Selected (College, Food, etc):

╔════════════════════════════════════════════╗
║        Group Details                      ║
╠════════════════════════════════════════════╣
║                                             │
║  Group Name *                               │
║  ┌────────────────────────────────────┐    ║
║  │ Computer Science Department        │    ║
║  └────────────────────────────────────┘    ║
║                                             ║
║  📋 Select Emoji/Icon                      │
║  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ║
║  │ 🎓  │ │ 📚  │ │ 💻  │ │ 🖊️  │ │ ➕  │ ║
║  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ ║
║                                             ║
║  👥 Members (multiple select)               │
║  ┌────────────────────────────────────┐    ║
║  │ Select members to add to group     │    ║
║  ├────────────────────────────────────┤    ║
║  │ ✓ Arjun Divraniya                  │    ║
║  │ ✓ Rahul Sharma                     │    ║
║  │   Priya Patel                      │    ║
║  │   Vikram Singh                     │    ║
║  └────────────────────────────────────┘    ║
║                                             ║
║  📝 Description (optional)                 ║
║  ┌────────────────────────────────────┐    ║
║  │ Shared expenses for CS dept        │    ║
║  └────────────────────────────────────┘    ║
║                                             ║
║                  [  Create  ]              ║
║                                             ║
╚════════════════════════════════════════════╝
```

---

## 📱 STEP 3: Group Detail Screen

### Regular Group (College, Food, etc.)

```
╔════════════════════════════════════════════╗
║  ← 🎓 College Snacks                       ║
║                                             │
║  5 members · ₹2,400 total spent            ║
║                                             ║
├──────┬──────┬──────────────────────────────┤
│ Exp  │ Bal  │ Settlement                   │
├──────┴──────┴──────────────────────────────┤
║                                             │
║ 💳 Recent Expenses                         ║
║ ┌──────────────────────────────────────┐  ║
║ │ 🍔 Lunch at Dominos        → ₹1,200  │  ║
║ │ Paid by Arjun · Split 4 ways          │  ║
║ │ 10 minutes ago                         │  ║
║ └──────────────────────────────────────┘  ║
║                                             ║
║ ┌──────────────────────────────────────┐  ║
║ │ ☕ Coffee & snacks         → ₹600    │  ║
║ │ Paid by Rahul · Split 3 ways          │  ║
║ │ 1 hour ago                            │  ║
║ └──────────────────────────────────────┘  ║
║                                             ║
║ 📊 Balance                                 ║
║ ┌──────────────────────────────────────┐  ║
║ │ You get ₹350 from group              │  ║
║ │ • Arjun owes you ₹200                │  ║
║ │ • Priya owes you ₹150                │  ║
║ └──────────────────────────────────────┘  ║
║                                             ║
║                      [  + Add Expense  ]   ║
║                                             ║
╚════════════════════════════════════════════╝
```

### Trip Group Detail

```
╔════════════════════════════════════════════╗
║  ← ✈️ Goa Trip 2025                        ║
║                                             │
║  Jan 15–18 · Mumbai → Goa                  ║
║  4 members · ₹16,500 spent                 ║
║                                             ║
├─────┬─────┬──────┬──────────────────────────┤
│ Exp │Timeline│Bal │ Settlement              │
├─────┴─────┴──────┴──────────────────────────┤
║                                             │
║ 📊 Trip Budget: ₹30,000                   ║
║ ████████░░░░░░░░░░░░  55%                 ║
║ Spent: ₹16,500 | Remaining: ₹13,500     ║
║                                             ║
║ 📅 Day 1: Friday, Jan 15                  ║
║ ├─ 🏨 Hotel         Paid by Arjun - ₹4,200│
║ ├─ 🍔 Dinner        Paid by Rahul - ₹1,800│
║ └─ Total: ₹6,000                          ║
║                                             ║
║ 📅 Day 2: Saturday, Jan 16                ║
║ ├─ 🏖️ Beach ride     Paid by Arjun - ₹600 │
║ └─ Total: ₹600                            ║
║                                             ║
║ 📅 Day 3: Sunday, Jan 17                  ║
║ ├─ 🍜 Street food    Paid by Priya - ₹800 │
║ └─ Total: ₹800                            ║
║                                             ║
║ 📅 Day 4: Monday, Jan 18                  ║
║ └─ No expenses yet                        ║
║                                             ║
║                      [  + Add Expense  ]   ║
║                                             ║
╚════════════════════════════════════════════╝
```

**Tab Structure:**
- **Expenses**: All expenses in list
- **Timeline**: Day-wise breakdown (Trip only)
- **Balance**: Who owes whom
- **Settlement**: Mark as settled

---

## 🎴 Group Listing Cards

### Regular Group Card

```
┌──────────────────────────────┐
│ 🎓 College Snacks            │
│ 5 members · Active           │
├──────────────────────────────┤
│ Total Spent:  ₹2,400         │
│ You Get:      ₹350           │
└──────────────────────────────┘
```

### Trip Group Card

```
┌──────────────────────────────┐
│ ✈️ Goa Trip 2025             │
│ Jan 15–18 · 4 days           │
│ 📍 Mumbai → Goa              │
├──────────────────────────────┤
│ Total Spent:  ₹16,500        │
│ You Owe:      ₹600           │
│ Budget: 55% of ₹30,000       │
└──────────────────────────────┘
```

---

## 📊 Timeline View (Trip Groups Only)

```
╔════════════════════════════════════════════╗
║        TIMELINE - Goa Trip 2025            ║
╠════════════════════════════════════════════╣
║                                             │
║  💰 Trip Budget: ₹30,000                  ║
║  ████████░░░░░░░░░░░░ 55% (₹16,500)       ║
║  Spent: ₹16,500  |  Remaining: ₹13,500   ║
║                                             ║
║  ⚠️ You've spent over 80% of budget!      ║
║                                             ║
║  ───────────────────────────────────────   ║
║                                             ║
║  📅 Day 1: Tuesday, Jan 15        ₹6,000  ║
║  ├─ 🏨 Hotel - Arjun - ₹4,200             ║
║  │  Split: Arjun (₹2,800), Rahul (₹1,400)║
║  └─ 🍔 Dinner - Rahul - ₹1,800            ║
║     Split: Arjun (₹900), Rahul (₹900)     ║
║                                             ║
║  ───────────────────────────────────────   ║
║                                             ║
║  📅 Day 2: Wednesday, Jan 16      ₹600   ║
║  └─ 🏖️ Beach ride - Arjun - ₹600         ║
║     Split: Arjun (₹300), Rahul (₹300)     ║
║                                             ║
║  ───────────────────────────────────────   ║
║                                             ║
║  📅 Day 3: Thursday, Jan 17       ₹8,000  ║
║  ├─ 🍜 Street food - Priya - ₹800         ║
║  ├─ 🎪 Theme park - Arjun - ₹5,500        ║
║  └─ 🚂 Local train - Rahul - ₹1,700       ║
║                                             ║
║  ───────────────────────────────────────   ║
║                                             ║
║  📅 Day 4: Friday, Jan 18                 ║
║  └─ No expenses yet                       ║
║                                             ║
╚════════════════════════════════════════════╝
```

---

## 🔌 Component Usage Breakdown

| Screen | Components Used |
|--------|-----------------|
| **Create Step 1** | `GroupTypeSelector` |
| **Create Step 2** | `TripDatePicker`, TextInput, AmountInput, Toggle |
| **Create Step 3** | `MemberSelector` |
| **Group Detail** | `GroupCard`, `TimelineTab` (if trip), TabBar |
| **Groups List** | `GroupCard[]` |
| **Trip Timeline** | `TimelineTab` |

---

## 🎨 Design Tokens

```typescript
// From UI Guide (Already in code)
const COLORS = {
  surface: '#0F0F1A',
  elevated: '#1A1A2B',
  violet: '#7C5CFC',      // Primary CTA
  violetLight: '#9B7FFF',
  mint: '#00E5B0',        // Success/You Get
  coral: '#FF5F7E',       // Danger/You Owe
  amber: '#FFB547',       // Warning
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#55556A',
  border: 'rgba(255, 255, 255, 0.06)',
};

const typography = {
  displayFont: 'Syne_800ExtraBold',
  bodyFont: 'DMSans_400Regular',
  
  heading: { size: 20, weight: 800, family: 'Syne' },
  subheading: { size: 16, weight: 700, family: 'Syne' },
  body: { size: 14, weight: 400, family: 'DMSans' },
  caption: { size: 12, weight: 400, family: 'DMSans' },
  label: { size: 11, weight: 600, family: 'DMSans' },
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};
```

---

## ✨ Micro-interactions

1. **Type Selection**: Card expands, checkmark appears (duration: 300ms)
2. **Date Picker**: Modal slides up from bottom (iOS)
3. **Budget Warning**: Alert animates in when threshold crossed
4. **Expense Addition**: New item slides in from bottom
5. **Tab switching**: Content crossfades smoothly
6. **Pull to refresh**: Budget update animates

---

## 📐 Responsive Breakpoints

```
Phone (320-768px)
├─ 16px horizontal padding
├─ Single column layouts
└─ Full-width buttons

Tablet (768px+)
├─ 24px horizontal padding
├─ Multi-column where applicable
└─ Larger fonts + spacing
```

---

## 🎯 Component Hierarchy

```
CreateGroupScreen
├── GroupTypeSelector (Step 1)
│   └── 6 Type Cards
├── ConditionalFields (Step 2)
│   ├── TripDatePicker (if Trip)
│   ├── TextInputs (common)
│   └── Toggles (if Trip)
└── MemberSelector (Step 3)
    └── Member Items

GroupDetailScreen
├── GroupHeader
│   ├── Emoji + Name
│   ├── Duration (if Trip)
│   └── Destination (if Trip)
├── TabBar
└── TabContent
    ├── ExpensesList
    ├── TimelineTab (if Trip)
    │   ├── BudgetStatus
    │   └── DayBlocks
    └── BalanceView

GroupsListScreen
├── Header + CreateButton
└── GroupCard[]
    ├── Card Header (name, emoji)
    ├── Card Info (dates, destination)
    └── Card Footer (totals, balance)
```

---

## 🚀 Implementation Order

**Priority 1 (Must Have):**
1. GroupTypeSelector
2. TripDatePicker
3. create.tsx screen
4. [id].tsx screen (detail)
5. TimelineTab (trip groups)

**Priority 2 (Should Have):**
6. GroupCard
7. list.tsx screen
8. Budget tracking UI
9. Member selection

**Priority 3 (Nice to Have):**
10. Animations
11. Loading states
12. Error messages
13. Accessibility

---

## ✅ Quality Checklist

- [ ] All colors from UI guide used
- [ ] All fonts (Syne, DM Sans) applied
- [ ] Touch targets ≥44x44pt
- [ ] No content overflow
- [ ] Proper spacing/padding
- [ ] Ionicons used for icons
- [ ] Dark mode compliant
- [ ] Font weights match figma
- [ ] Responsive on all sizes
- [ ] Smooth transitions (300ms)

---

**Status:** ✅ Ready for Implementation  
**All Components:** Created & Documented  
**Next Step:** Implement screen files (create.tsx, [id].tsx, list.tsx)
