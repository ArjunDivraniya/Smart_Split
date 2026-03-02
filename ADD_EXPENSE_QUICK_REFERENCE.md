# 🚀 Add Expense Screen — Quick Reference

## 📁 File Locations

```
Mobile-App/
├── app/group/add-expense.tsx                   // Main screen
├── src/utils/splitCalculator.ts                // Split algorithms
└── components/expenses/
    ├── AmountInput.tsx                         // ₹ Amount input
    ├── CategorySelector.tsx                    // Category chips
    ├── SplitTypeSelector.tsx                   // Split type grid
    ├── MemberSelector.tsx                      // Member checkboxes
    └── SplitPreview.tsx                        // Real-time preview
```

---

## 🔄 Navigation

```typescript
// From Group Detail Screen → Add Expense
router.push(`/group/add-expense?id=${groupId}`);

// After saving → Back to Group Detail
router.back();
```

---

## 🧮 Split Calculator Usage

```typescript
import {
  SplitType,
  calculateSplit,
  validateSplit,
  formatAmount,
} from '@/src/utils/splitCalculator';

// Calculate split
const results = calculateSplit('percentage', 1000, [
  { userId: '1', userName: 'Alice', value: 60 },
  { userId: '2', userName: 'Bob', value: 40 },
]);

// Results format
[
  { userId: '1', userName: 'Alice', amount: 600, percentage: 60 },
  { userId: '2', userName: 'Bob', amount: 400, percentage: 40 },
]

// Validate
const validation = validateSplit('percentage', 1000, participants);
if (!validation.valid) {
  console.error(validation.error);
}

// Format numbers
formatAmount(1234.56); // "1,234.56"
```

---

## 🎯 Split Types

| Type | Value Field | Validation | Example |
|------|-------------|------------|---------|
| `equal` | No input needed | None | Amount ÷ N members |
| `percentage` | Enter % | Must sum to 100% | Alice 60%, Bob 40% |
| `exact` | Enter ₹ | Must sum to total | Alice ₹600, Bob ₹400 |
| `shares` | Enter shares | All > 0 | Alice 3 shares, Bob 2 shares |

---

## 📤 API Request

```typescript
POST /api/groups/:groupId/expenses

// Body - Equal Split
{
  amount: 900,
  description: "Dinner",
  category: "Food",
  paidBy: "userId123",
  splitType: "equal",
  splitBetween: ["userId123", "userId456", "userId789"],
  date: "2024-01-15T10:00:00.000Z",
  notes: ""
}

// Body - Percentage Split
{
  // ...same as above...
  splitType: "percentage",
  splitPercentages: {
    "userId123": 50,
    "userId456": 30,
    "userId789": 20
  }
}

// Body - Exact Split
{
  // ...same as above...
  splitType: "exact",
  splitAmounts: {
    "userId123": 300,
    "userId456": 200,
    "userId789": 100
  }
}

// Body - Shares Split
{
  // ...same as above...
  splitType: "shares",
  splitShares: {
    "userId123": 2,
    "userId456": 1,
    "userId789": 1
  }
}
```

---

## ✅ Validation Rules

```typescript
// Amount
amount > 0

// Description
description.trim().length > 0

// PaidBy
paidBy is selected

// Members
selectedMembers.length > 0

// Split Type Specific
switch (splitType) {
  case 'percentage':
    sum(values) === 100
  case 'exact':
    sum(values) === amount
  case 'shares':
    all values > 0
}
```

---

## 🎨 Categories

```typescript
const categories = [
  { id: 'Food', icon: 'restaurant', color: '#f59e0b' },
  { id: 'Transport', icon: 'car', color: '#3b82f6' },
  { id: 'Stay', icon: 'bed', color: '#8b5cf6' },
  { id: 'Fuel', icon: 'rocket', color: '#ef4444' },
  { id: 'Entertainment', icon: 'game-controller', color: '#ec4899' },
  { id: 'Shopping', icon: 'cart', color: '#22c55e' },
  { id: 'Other', icon: 'ellipsis-horizontal', color: '#64748b' },
];
```

---

## 🧪 Test Cases

```typescript
// Equal Split
Amount: ₹900, Members: 3
Expected: ₹300 each

// Percentage Split
Amount: ₹1000, Alice: 60%, Bob: 40%
Expected: Alice ₹600, Bob ₹400

// Exact Split
Amount: ₹500, Alice: ₹200, Bob: ₹150, Charlie: ₹150
Expected: Exact amounts as entered

// Shares Split
Amount: ₹400, Alice: 2 shares, Bob: 1 share, Charlie: 1 share
Expected: Alice ₹200, Bob ₹100, Charlie ₹100
```

---

## 🚨 Common Errors

```typescript
// Percentage doesn't sum to 100%
"Percentages must sum to 100%"

// Exact amounts don't match total
"Sum of amounts (₹800.00) does not equal total (₹1,000.00)"

// No members selected
"At least one member must be selected"

// Amount not entered
"Amount must be greater than 0"
```

---

## 💡 Key Functions

```typescript
// In add-expense.tsx

loadData()                    // Load group members & current user
handleMemberToggle(userId)    // Toggle member checkbox
handleMemberValueChange(userId, value) // Update split value
handleSplitTypeChange(type)   // Change split type
validateForm()                // Validate all fields
handleSubmit()                // Save to backend
```

---

## 🎯 State Structure

```typescript
// Form State
const [amount, setAmount] = useState('');
const [description, setDescription] = useState('');
const [category, setCategory] = useState('Food');
const [date, setDate] = useState(new Date());
const [paidBy, setPaidBy] = useState('');
const [splitType, setSplitType] = useState<SplitType>('equal');
const [selectedMembers, setSelectedMembers] = useState<Participant[]>([]);
const [notes, setNotes] = useState('');

// Validation
const [errors, setErrors] = useState<Record<string, string>>({});

// Loading
const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);
```

---

## 📊 Component Props

```typescript
// AmountInput
<AmountInput value={string} onChange={fn} error={?string} />

// CategorySelector
<CategorySelector selected={string} onSelect={fn} />

// SplitTypeSelector
<SplitTypeSelector selected={SplitType} onSelect={fn} />

// MemberSelector
<MemberSelector
  members={GroupMember[]}
  selected={Participant[]}
  onToggle={fn}
  splitType={SplitType}
  onValueChange={fn}
  currentUserId={string}
/>

// SplitPreview
<SplitPreview
  splitResults={SplitResult[] | null}
  paidByUserId={string}
  paidByUserName={string}
  totalAmount={number}
  currentUserId={string}
  validationError={?string}
/>
```

---

## ⚡ Quick Actions

```typescript
// Add quick amount
setAmount((prev) => (parseFloat(prev || '0') + 100).toString());

// Select all members
setSelectedMembers(groupMembers.map(m => ({
  userId: m.userId,
  userName: m.userName,
  value: 0
})));

// Reset split values when changing type
const defaultValue = splitType === 'shares' ? 1 : 0;
setSelectedMembers(members.map(m => ({ ...m, value: defaultValue })));
```

---

## 🏆 Best Practices

1. **Always validate before submitting**
   - Frontend validation prevents bad data
   - Backend re-validates for security

2. **Show real-time preview**
   - Users can see exactly what will happen
   - Reduces errors and support requests

3. **Handle edge cases**
   - Rounding errors (distribute extra cents)
   - Empty states (no members selected)
   - Loading states (fetching data)

4. **User-friendly messages**
   - "You paid ₹600. You get ₹300 back"
   - "You owe ₹150"
   - Clear error messages

5. **Responsive UI**
   - Disable save until valid
   - Show loading indicators
   - Navigate back on success

---

## 🔧 Debugging

```typescript
// Log split results
console.log('Split Results:', calculateSplit(splitType, amount, members));

// Log validation
console.log('Validation:', validateSplit(splitType, amount, members));

// Log request body
console.log('Request Body:', {
  amount: parseFloat(amount),
  description,
  category,
  paidBy,
  splitType,
  splitBetween: selectedMembers.map(m => m.userId),
  // ... rest of body
});
```

---

## 📱 UI Hierarchy

```
1. Header (with close button)
2. Amount Input (largest, most prominent)
3. Description
4. Category (horizontal scroll)
5. Date
6. Who Paid (radio list)
7. Split Type (2×2 grid)
8. Member Selection (checkboxes + inputs)
9. Preview (real-time)
10. Notes (optional)
11. Save Button (fixed at bottom)
```

---

## ✅ Checklist

Before submitting:
- [ ] Amount > 0
- [ ] Description not empty
- [ ] Category selected
- [ ] PaidBy selected
- [ ] At least 1 member selected
- [ ] Split validation passes
- [ ] Preview shows correct amounts

---

**🎉 You're ready to use the Add Expense Screen!**

For detailed documentation, see [ADD_EXPENSE_SCREEN_COMPLETE.md](./ADD_EXPENSE_SCREEN_COMPLETE.md)
