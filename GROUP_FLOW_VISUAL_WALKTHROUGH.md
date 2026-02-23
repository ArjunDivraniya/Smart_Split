# πŸŽ� GROUP FLOW - VISUAL UI WALKTHROUGH

**Complete Visual Guide to All Screens & Components**

---

## 🏠 SCREEN 1: Groups Listing Screen

**Path:** `/groups` (Tab Navigation)

```
β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"
β"‚                                                    β"‚
β"‚  Groups                                        [+]  β"‚   ← Header: Title + Create button
β"‚  3 groups                                           β"‚      Subheader: Count
β"‚                                                    β"‚
β"œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€
β"‚                                                    β"‚
β"‚  β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€  β"‚
β"‚  β"‚  ✈️  Bali Trip 2025                          β"‚  β"‚   ← TRIP GROUP CARD
β"‚  β"‚      Jan 15–18 β€' 4 days                      β"‚  β"‚      Icon + Name
β"‚  β"‚      πŸ"  Bali, Indonesia                      β"‚  β"‚      Trip dates
β"‚  β"‚                                                β"‚  β"‚      Destination
β"‚  β"‚      [β"Š======-->       ] 82% (Amber)        β"‚  β"‚      Budget progress bar
β"‚  β"‚      Total: ₹24,500 | You Owe: ₹800 🔴      β"‚  β"‚      Footer: Totals
β"‚  └β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€  β"‚
β"‚                                                    β"‚
β"‚  β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€  β"‚
β"‚  β"‚  🎓  College Group                            β"‚  β"‚   ← REGULAR GROUP CARD
β"‚  β"‚      3 members                                β"‚  β"‚      Icon + Name
β"‚  β"‚                                                β"‚  β"‚      Member count
β"‚  β"‚      Total: ₹5,200 | You Get: ₹1,200 πŸŸ'   β"‚  β"‚      Footer: Totals
β"‚  └β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€  β"‚
β"‚                                                    β"‚
β"‚  β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€  β"‚
β"‚  β"‚  🍔  Food & Snacks                            β"‚  β"‚   ← REGULAR GROUP CARD
β"‚  β"‚      4 members                                β"‚  β"‚
β"‚  β"‚                                                β"‚  β"‚
β"‚  β"‚      Total: ₹3,600 | You Owe: ₹400 πŸ"΄       β"‚  β"‚
β"‚  └β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€  β"‚
β"‚                                                    β"‚
└────────────────────────────────────────────────────┘
```

**Color Scheme:**
- Background: `#080810` (void - dark)
- Card: `#1A1A2B` (elevated)
- Text: `#F0F0FF` (light)
- Accent: `#7C5CFC` (violet button)
- Positive: `#00E5B0` (mint - you get)
- Negative: `#FF5F7E` (coral - you owe)
- Warning: `#FFB547` (amber - budget progress)

**Empty State (No Groups):**
```
β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"
β"‚                                                    β"‚
β"‚  Groups                                        [+]  β"‚
β"‚  0 groups                                          β"‚
β"‚                                                    β"‚
β"œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€
β"‚                                                    β"‚
β"‚                                                    β"‚
β"‚                      πŸ'₯                         β"‚
β"‚                 No Groups Yet                     β"‚
β"‚        Create your first group to start        β"‚
β"‚             tracking shared expenses            β"‚
β"‚                                                    β"‚
β"‚              [+ Create Group]                     β"‚   ← Call-to-action button
β"‚                                                    β"‚
β"‚                                                    β"‚
└────────────────────────────────────────────────────┘
```

---

## ✨ SCREEN 2: Create Group - Multi-Step Wizard

### STEP 1: Choose Group Type (Visual Grid)

**Path:** `/group/create` → Step 1

```
β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"
β"‚  [<]  Create Group                           1/3   β"‚
β"œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€
β"‚                                                    β"‚
β"‚  Select Group Type                                β"‚
β"‚  Choose what kind of group this is               β"‚
β"‚                                                    β"‚
β"‚  β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"  β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"  β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"  β"‚
β"‚  β"‚   ✈️    β"‚  β"‚   🎓    β"‚  β"‚   🍔    β"‚  β"‚
β"‚  β"‚   Trip  β"‚  β"‚ College β"‚  β"‚   Food   β"‚  β"‚
β"‚  β"‚    &    β"‚  β"‚  & Work β"‚  β"‚ & Snacks β"‚  β"‚
β"‚  β"‚  Hotel  β"‚  β"‚         β"‚  β"‚         β"‚  β"‚   ← 3x2 Grid
β"‚  β"‚  βœ… βœ"    β"‚  β"‚         β"‚  β"‚         β"‚  β"‚      Checkmark shows selection
β"‚  β"‚ (Violet)β"‚  β"‚         β"‚  β"‚         β"‚  β"‚
β"‚  └β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€  └β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€  └β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€  β"‚
β"‚                                                    β"‚
β"‚  β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"  β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"  β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"  β"‚
β"‚  β"‚   🏠    β"‚  β"‚   🎉    β"‚  β"‚   ➕    β"‚  β"‚
β"‚  β"‚Flatmates β"‚  β"‚  Event  β"‚  β"‚ Custom  β"‚  β"‚
β"‚  β"‚  Shared   β"‚  β"‚  Party  β"‚  β"‚ Create  β"‚  β"‚
β"‚  β"‚ Expenses  β"‚  β"‚Expenses β"‚  β"‚  Your   β"‚  β"‚
β"‚  β"‚         β"‚  β"‚         β"‚  β"‚ Own Type β"‚  β"‚
β"‚  └β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€  └β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€  └β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€  β"‚
β"‚                                                    β"‚
β"‚  β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"  β"‚
β"‚  β"‚ β„Ή  Trip: Travel & vacation expenses        β"‚  β"‚   ← Info Box (below selected)
β"‚  β"‚     Perfect for group vacations           β"‚  β"‚      Shows details & description
β"‚  └β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"  β"‚
β"‚                                                    β"‚
β"œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€
β"‚  [Cancel]                          [Next >]       β"‚   ← Footer: Navigation (Next enabled)
└────────────────────────────────────────────────────┘
```

---

### STEP 2: Group Details

**Path:** `/group/create` → Step 2

**For ANY group type:**
```
β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"
β"‚  [<]  Create Group                           2/3   β"‚
β"œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€
β"‚                                                    β"‚
β"‚  Group Details                                     β"‚
β"‚                                                    β"‚
β"‚  Choose Emoji                                     β"‚   ← Emoji picker
β"‚  [✈️] [🎓] [🍔] [🏠] [🎉] [πŸ'₯] [πŸ—ΊοΈ] [🎪] β"‚   ← Horizontal scroll grid
β"‚  [🏖️] [πŸž] ...                                   β"‚
β"‚                                                    β"‚
β"‚  Group Name *                                     β"‚   ← Required field
β"‚  [ Bali Trip 2025                              ] β"‚
β"‚                                                    β"‚
β"‚  Description                                      β"‚   ← Optional
β"‚  [ An amazing trip with friends and family...  ] β"‚
β"‚  [                                              ] β"‚
β"‚                                                    β"‚
β"œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€
β"‚  [< Back]                          [Next >]       β"‚   ← Back enabled, Next enabled if name filled
└────────────────────────────────────────────────────┘
```

---

### STEP 3: Trip-Specific Fields (If TRIP selected)

**Path:** `/group/create` → Step 3 → Trip Branch

```
β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"
β"‚  [<]  Create Group                           3/3   β"‚
β"œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€
β"‚                                                    β"‚
β"‚  Trip Details                                      β"‚
β"‚                                                    β"‚
β"‚  Trip Dates *                                     β"‚   ← Date picker step
β"‚  [βŒ€ Wed, Jan 15, 2025] β†' [Thu, Jan 18, 2025 βŒ₯] β"‚
β"‚                                                    β"‚
β"‚                  [4 days]                         β"‚   ← Duration display
β"‚                  (amber box)                      β"‚
β"‚                                                    β"‚
β"‚  Destination                                      β"‚   ← Optional
β"‚  [ Bali, Indonesia                              ] β"‚
β"‚                                                    β"‚
β"‚  Track Budget              [Toggle: OFF/ON]       β"‚   ← Toggle switch (mint when ON)
β"‚                                                    β"‚
β"‚  Trip Budget                                      β"‚   ← Shows only if Track Budget ON
β"‚  ₹ [ 30,000                                     ] β"‚
β"‚                                                    β"‚
β"œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€
β"‚  [< Back]            [Create Group] (Loading)     β"‚
└────────────────────────────────────────────────────┘
```

**Date Picker (iOS - Modal Style):**
```
┌────────────────────────────┐
│  Select Start Date         │
├────────────────────────────┤
│                            │
│   ← 2025 | January | 15 β†' β"‚   ← Spinner wheels (native)
│                            │
│ ┌─ Hours,Mins,Secs β€"  β"‚
β"‚
├────────────────────────────┤
│  [Done]                    β"‚   ← Confirm button
└────────────────────────────┘
```

---

### STEP 3: Regular Groups (If NOT Trip)

**Path:** `/group/create` → Step 3 → Regular Branch

```
β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"
β"‚  [<]  Create Group                           3/3   β"‚
β"œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€
β"‚                                                    β"‚
β"‚  Ready to Create                                   β"‚
β"‚                                                    β"‚
β"‚                                                    β"‚
β"‚                    🎓                             β"‚   ← Preview box
β"‚                 College Group                     β"‚      Shows what user will create
β"‚           Shared learning expenses               β"‚
β"‚                                                    β"‚
β"‚                                                    β"‚
β"œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€
β"‚  [< Back]         [Create Group]                  β"‚   ← Create button (enabled)
└────────────────────────────────────────────────────┘
```

---

## πŸ"Ž SCREEN 3: Group Detail Screen

**Path:** `/group/{id}`

```
β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"
β"‚  [<]  ✈️  Bali Trip               3 members [...]  β"‚   ← Header
β"œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€
β"‚                                                    β"‚
β"‚  β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"  β"‚
β"‚  β"‚ [πŸ"…] Jan 15, 2025 - Jan 18, 2025          β"‚  β"‚   ← Trip info banner
β"‚  β"‚ [πŸ"…] πŸ"  Bali, Indonesia                   β"‚  β"‚
β"‚  └β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"  β"‚
β"‚                                                    β"‚
β"‚  β"Œ─ Expenses ─┬─ Balance ─┬─ Timeline ──┐      β"‚   ← Tab navigation
β"‚  β""  (active)   β"‚  (inactive)  β"‚  (inactive) β"‚      Last tab only for trips
β"‚                                                    β"‚
β"‚  ┌─────────────────────────────────────────────┐  β"‚   ← Expenses Tab Content
β"‚  β"‚ Lunch with team      Food      ₹500        β"‚  β"‚
β"‚  β"‚ Paid by Alice        Delete[πŸ—']/    β"‚
β"‚  β"‚                                             β"‚  β"‚
β"‚  β"‚ Hotel Check-in       Hotel    ₹3,000       β"‚  β"‚
β"‚  β"‚ Paid by Bob          Delete[πŸ—']/    β"‚
β"‚  β"‚                                             β"‚  β"‚
β"‚  β"‚ Transport            Travel   ₹200        β"‚  β"‚
β"‚  β"‚ Paid by Charlie      Delete[πŸ—']/    β"‚
β"‚  └─────────────────────────────────────────────┘  β"‚
β"‚                                                    β"‚
β"œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€
β"‚                          [+] Add Expense          β"‚   ← FAB button (bottom)
└────────────────────────────────────────────────────┘
```

**Balance Tab:**
```
β"Œ─ Expenses ─┬─ Balance ─┬─ Timeline ──┐
β"‚             β""  (active)  β"‚  (inactive) β"‚

┌─────────────────────────────────────────────┐
β"‚ Alice owes Charlie            ₹500 πŸ"΄   β"‚   ← Settlement item (coral/red)
β"‚                                            β"‚
β"‚ Bob owes Alice                ₹300 πŸ"΄   β"‚
β"‚                                            β"‚
β"‚ You don't owe anyone                       β"‚
└─────────────────────────────────────────────┘
```

**Timeline Tab (TRIP ONLY):**
```
β"Œ─ Expenses ─┬─ Balance ─┬─ Timeline ──┐
β"‚             β"‚  (inactive)  β""  (active)   β"‚

┌──────────────────────────────────────────────┐
β"‚ Trip Budget: ₹30,000                       β"‚
β"‚ [=====>            ] 82% used              β"‚   ← Progress bar (color-coded)
β"‚ Spent: ₹24,500                             β"‚
β"‚ Remaining: ₹5,500                          β"‚
β"‚ ⚠️  You've spent over 80%                 β"‚   ← Warning box (amber)
└──────────────────────────────────────────────┘

Day 1 - Tuesday, Jan 15
├─ Lunch with team        Food    ₹500
├─ Hotel Check-in         Hotel   ₹3,000
└─ Transport              Travel  ₹200
   Total: ₹3,700

Day 2 - Wednesday, Jan 16
├─ Sightseeing            Tour    ₹800
├─ Dinner                 Food    ₹600
└─ Shopping               Shopping ₹1,200
   Total: ₹2,600

Day 3 - Thursday, Jan 17
├─ Breakfast              Food    ₹300
└─ Activities             Tour    ₹1,400
   Total: ₹1,700

Day 4 - Friday, Jan 18
├─ Return transport       Travel  ₹500
└─ Lunch                  Food    ₹800
   Total: ₹1,300

(Grand Total: ₹9,300 for trip)
```

---

## 🎨 COMPONENT: GroupTypeSelector

**Renders:** 6 interactive type cards

```
β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"
β"‚                                                    β"‚
β"‚  Select Group Type                                β"‚
β"‚  Choose what kind of group this is               β"‚
β"‚                                                    β"‚
β"‚  β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"  β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"  β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"  β"‚
β"‚  β"‚          β"‚  β"‚          β"‚  β"‚          β"‚  β"‚
β"‚  β"‚   ✈️    β"‚  β"‚   🎓    β"‚  β"‚   🍔    β"‚  β"‚
β"‚  β"‚  (40pt)  β"‚  β"‚  (40pt)  β"‚  β"‚  (40pt)  β"‚  β"‚
β"‚  β"‚          β"‚  β"‚          β"‚  β"‚          β"‚  β"‚
β"‚  β"‚   Trip   β"‚  β"‚ College  β"‚  β"‚   Food   β"‚  β"‚   ← 2×3 grid
β"‚  β"‚ (14pt)   β"‚  β"‚  (14pt)  β"‚  β"‚  (14pt)  β"‚  β"‚      Each card:
β"‚  β"‚          β"‚  β"‚          β"‚  β"‚          β"‚  β"‚      - Emoji (top)
β"‚  β"‚  Travel  β"‚  β"‚  Shared  β"‚  β"‚  Food    β"‚  β"‚      - Label (middle)
β"‚  β"‚ & hotel  β"‚  β"‚ group    β"‚  β"‚ sharing  β"‚  β"‚      - Description (bottom)
β"‚  β"‚ (11pt)   β"‚  β"‚ (11pt)   β"‚  β"‚ (11pt)   β"‚  β"‚      - Checkmark if selected
β"‚  β"‚          β"‚  β"‚          β"‚  β"‚          β"‚  β"‚
β"‚  β"‚   βœ… β"‚  β"‚          β"‚  β"‚          β"‚  β"‚
β"‚  β"‚(Violet) β"‚  β"‚          β"‚  β"‚          β"‚  β"‚
β"‚  └β"€β"€β"€β"€β"€β"€β"€β"€β"€  └β"€β"€β"€β"€β"€β"€β"€β"€β"€  └β"€β"€β"€β"€β"€β"€β"€β"€β"€  β"‚
β"‚                                                    β"‚
β"‚  β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"  β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"  β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"  β"‚
β"‚  β"‚          β"‚  β"‚          β"‚  β"‚          β"‚  β"‚
β"‚  β"‚   🏠    β"‚  β"‚   🎉    β"‚  β"‚   ➕    β"‚  β"‚
β"‚  β"‚          β"‚  β"‚          β"‚  β"‚          β"‚  β"‚
β"‚  β"‚Flatmates β"‚  β"‚  Event   β"‚  β"‚  Custom  β"‚  β"‚
β"‚  β"‚          β"‚  β"‚          β"‚  β"‚          β"‚  β"‚
β"‚  β"‚Shared    β"‚  β"‚  Party   β"‚  β"‚ Create   β"‚  β"‚
β"‚  β"‚ living   β"‚  β"‚ expenses β"‚  β"‚  your    β"‚  β"‚
β"‚  β"‚expenses  β"‚  β"‚          β"‚  β"‚  own     β"‚  β"‚
β"‚  β"‚          β"‚  β"‚          β"‚  β"‚          β"‚  β"‚
β"‚  └β"€β"€β"€β"€β"€β"€β"€β"€β"€  └β"€β"€β"€β"€β"€β"€β"€β"€β"€  └β"€β"€β"€β"€β"€β"€β"€β"€β"€  β"‚
β"‚                                                    β"‚
β"‚  β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"  β"‚
β"‚  β"‚ β„Ή  Trip: Travel & vacation expenses        β"‚  β"‚
β"‚  β"‚     Perfect for group vacations           β"‚  β"‚   ← Info box explaining selection
β"‚  β"‚     β€' Track daily expenses               β"‚  β"‚      Shows emoji + label + description
β"‚  β"‚     β€' Monitor budget progress            β"‚  β"‚
β"‚  β"‚     β€' Split costs among members          β"‚  β"‚
β"‚  └β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"  β"‚
β"‚                                                    β"‚
└────────────────────────────────────────────────────┘
```

---

## πŸ"… COMPONENT: TripDatePicker

**Shows:** Start and end date buttons with duration

```
┌────────────────────────────────────┐
β"‚  Trip Dates *                      β"‚
β"‚                                    β"‚
β"‚  [βŒ€ Wed, Jan 15, 2025    βŒ†]   β"‚   ← Start date button (violet indicator)
β"‚                                    β"‚
β"‚                    β†'              β"‚   ← Chevron-down icon
β"‚                                    β"‚
β"‚  [Thu, Jan 18, 2025             βŒ₯]   ← End date button (mint indicator)
β"‚                                    β"‚
β"‚            [4 days]               β"‚   ← Duration in amber box
β"‚                                    β"‚
└────────────────────────────────────┘
```

**When User Taps (iOS Modal):**
```
┌─────────────────────────────────────┐
β"‚       SELECT START DATE             β"‚
├─────────────────────────────────────┤
β"‚                                     β"‚
β"‚     ← 2025 | January | 15 β†'       β"‚   ← Spinner (native iOS picker)
β"‚                                     β"‚      Can scroll year, month, day
β"‚                                     β"‚
β"œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"
β"‚                    [Done/Cancel]    β"‚
└─────────────────────────────────────┘
```

**When User Taps (Android Inline):**
```
┌─────────────────────────────────────┐
β"‚  SELECT START DATE                  β"‚
├─────────────────────────────────────┤
β"‚                                     β"‚
β"‚  [2025] [January] [15]             β"‚   ← Inline date selector (Android)
β"‚                                     β"‚
β"‚  [Cancel]              [Confirm]   β"‚
β"‚                                     β"‚
└─────────────────────────────────────┘
```

---

## 📊 COMPONENT: TimelineTab (Trip Only)

**Shows:** Budget progress + day-wise expenses

```
β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"
β"‚                                                    β"‚
β"‚   Budget Status (Smart Feature)                   β"‚
β"‚  β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"„
β"‚  β"‚  Trip Budget: ₹30,000                       β"‚β"‚   ← Budget amount
β"‚  β"‚  [=====>            ] 82% used              β"‚β"‚   ← Progress bar (amber)
β"‚  β"‚  Spent: ₹24,500   Remaining: ₹5,500        β"‚β"‚   ← Stats
β"‚  β"‚                                              β"‚β"‚
β"‚  β"‚  ⚠️  You've spent over 80%                 β"‚β"‚   ← Warning (amber background)
β"‚  └β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"„
β"‚                                                    β"‚
β"‚  Day 1 - Tuesday, Jan 15     TOTAL: ₹3,700      β"‚   ← Day header
β"‚  β€' Lunch with team          Food  ₹500        β"‚
β"‚  β€' Hotel Check-in           Hotel ₹3,000      β"‚
β"‚  β€' Transport                Travel ₹200       β"‚
β"‚                                                    β"‚
β"‚  Day 2 - Wednesday, Jan 16   TOTAL: ₹2,600     β"‚   ← Day header
β"‚  β€' Sightseeing              Tour  ₹800        β"‚
β"‚  β€' Dinner                   Food  ₹600        β"‚
β"‚  β€' Shopping                 Shop  ₹1,200      β"‚
β"‚                                                    β"‚
β"‚  Day 3 - Thursday, Jan 17    TOTAL: ₹1,700     β"‚   ← Day header
β"‚  β€' Breakfast                Food  ₹300        β"‚
β"‚  β€' Activities               Tour  ₹1,400      β"‚
β"‚                                                    β"‚
β"‚  Day 4 - Friday, Jan 18      TOTAL: ₹1,300     β"‚   ← Day header
β"‚  β€' Return transport          Travel ₹500       β"‚
β"‚  β€' Lunch                    Food  ₹800        β"‚
β"‚                                                    β"‚
β"‚  ═══════════════════════════════════════════     β"‚
β"‚  TRIP TOTAL: ₹9,300                             β"‚
β"‚                                                    β"‚
└────────────────────────────────────────────────────┘
```

**Budget Colors:**
- 🟒 **Safe** (0-79%): `[=========>     ]` Green bar
- πŸŸ' **Warning** (80-100%): `[=====>        ]` Amber bar + warning text
- 🔴 **Exceeded** (>100%): `[====>         ]` Red bar + "Budget exceeded!" alert

---

## 🎴 COMPONENT: GroupCard

**Regular Group (Non-Trip):**
```
β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"
β"‚  🎓  College Group                              β"‚
β"‚      3 members                                   β"‚
β"‚                                                  β"‚
β"‚  Total Spent: ₹5,200                           β"‚
β"‚  You Get: ₹1,200                                β"‚   ← Positive = mint/green
β"‚                                                  β"‚
└────────────────────────────────────────────────────┘
```

**Trip Group (Enhanced):**
```
β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"
β"‚  ✈️  Bali Trip 2025                             β"‚
β"‚      Jan 15–18 β€' 4 days                         β"‚   ← Trip dates (formatTripSummary)
β"‚      πŸ"  Bali, Indonesia                         β"‚   ← Destination
β"‚                                                  β"‚
β"‚      [=====>            ] 82% of ₹30,000       β"‚   ← Budget progress (amber)
β"‚                                                  β"‚
β"‚  Total Spent: ₹24,500                          β"‚
β"‚  You Owe: ₹800                                   β"‚   ← Negative = coral/red
β"‚                                                  β"‚
└────────────────────────────────────────────────────┘
```

**Inactive Group (with badge):**
```
β"Œβ"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"€β"
β"‚  🏠  Flatmates (2024)                           β"‚
β"‚      4 members                                   β"‚
β"‚                                                  β"‚
β"‚  Total: ₹8,500                                 β"‚
β"‚  Settled                                         β"‚   ← Dark overlay + "Ended" badge
β"‚                                                  β"‚
└────────────────────────────────────────────────────┘
```

---

## πŸŽ" TYPOGRAPHY HIERARCHY

**Fonts Used:**
- **Headers:** `Syne_800ExtraBold` (extra bold, modern)
- **Section Titles:** `Syne_700Bold` (bold)
- **Labels:** `DMSans_600SemiBold` (semi-bold, clean)
- **Body:** `DMSans_400Regular` (regular, readable)

**Font Sizes:**
```
Screen Title          24pt  Syne_800ExtraBold    #F0F0FF
Section Title         20pt  Syne_700Bold        #F0F0FF
Tab Label            13pt  DMSans_600SemiBold  Color-coded
Label/Category       14pt  DMSans_600SemiBold  #F0F0FF
Body Text            13pt  DMSans_400Regular   #F0F0FF
Muted/Helper         12pt  DMSans_400Regular   #8888AA
Value/Amount         14pt  DMSans_600SemiBold  Color-coded
```

---

## 🌈 COLOR CODING SYSTEM

**Context-based colors:**

```
Positive (You Get/Savings)
βœ" Balance owed to you → #00E5B0 (mint)
βœ" Positive indicators   → #00E5B0 (mint)
βœ" Success states       → #00E5B0 (mint)

Negative (You Owe/Debt)
βœ— Balance you owe      β†' #FF5F7E (coral)
βœ— Negative indicators   β†' #FF5F7E (coral)
βœ— Action items         β†' #FF5F7E (coral)

Warning (Caution)
⚠️  Budget 80-100%      β†' #FFB547 (amber)
⚠️  Caution indicators   β†' #FFB547 (amber)
⚠️  Progress indicators  β†' #FFB547 (amber)

Primary (Actions/Focus)
πŸ"Ό Button/Selection      β†' #7C5CFC (violet)
πŸ"Ό Primary CTA           β†' #7C5CFC (violet)
πŸ"Ό High emphasis text    β†' #7C5CFC (violet)

Background (Surfaces)
β‰ˆ Page background      β†' #080810 (void - darkest)
β‰ˆ Section background   β†' #0F0F1A (surface - very dark)
β‰ˆ Card background      β†' #1A1A2B (elevated - dark)
β‰ˆ Input background     β†' #14141F (card - darkest of elevated)

Text
β–' Primary text         β†' #F0F0FF (almost white)
β–' Secondary text       β†' #8888AA (gray)
β–' Muted text           β†' #55556A (darker gray)
β–' Disabled text        β†' #3A3A49 (very dark gray)
```

---

## ✨ ANIMATIONS & INTERACTIONS

**Touch Feedback:**
- All buttons/cards: `activeOpacity={0.7}` (slight dimming on press)
- Smooth 200ms transitions

**Transitions:**
- Screen navigation: Slide transitions
- Tab switches: Fade transitions
- Modals: Slide up from bottom

**Visual Feedback:**
- Form inputs: Border color change on focus (violet)
- Checkmarks: Scale animation on selection
- Progress bar: Smooth fill animation

---

## βœ… SUMMARY OF VISUAL ELEMENTS

| Element | Style | Color | Size |
|---------|-------|-------|------|
| Screen Header | Syne 800 | Violet | 28pt |
| Section Title | Syne 700 | Primary | 20pt |
| Card Title | DMSans 600 | Primary | 16pt |
| Label | DMSans 600 | Primary | 14pt |
| Body Text | DMSans 400 | Primary | 13-14pt |
| Button | DMSans 600 | White text | 14pt |
| Amount (Positive) | DMSans 600 | Mint | 14pt |
| Amount (Negative) | DMSans 600 | Coral | 14pt |
| Temperature (Warning) | DMSans 600 | Amber | 14pt |
| Card Padding | β€" | β€" | 16px |
| Button Radius | β€" | β€" | 12px |
| Card Radius | β€" | β€" | 16px |
| Touch Target | β€" | β€" | 44×44pt |

---

**All visuals follow the smartsplit-ui-guide.html specifications perfectly!**
