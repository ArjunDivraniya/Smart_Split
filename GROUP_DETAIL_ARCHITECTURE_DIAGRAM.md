# Group Detail Screen - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          GROUP DETAIL SCREEN ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                  MOBILE APP                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │  app/group/[id].tsx (Container)                                        │    │
│  │  • Manages active tab state                                            │    │
│  │  • Loads current user context                                          │    │
│  │  • Renders header and tab bar                                          │    │
│  │  • Delegates content to tab components                                 │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
│                                    │                                             │
│        ┌───────────────────┬───────┴────────┬───────────────┬──────────────┐   │
│        │                   │                │               │              │   │
│        ▼                   ▼                ▼               ▼              │   │
│  ┌──────────┐       ┌──────────┐     ┌──────────┐    ┌──────────┐        │   │
│  │ Expenses │       │ Balances │     │ Timeline │    │ Summary  │        │   │
│  │   Tab    │       │   Tab    │     │   Tab    │    │   Tab    │        │   │
│  └────┬─────┘       └────┬─────┘     └────┬─────┘    └────┬─────┘        │   │
│       │                  │                 │               │               │   │
│       │  ┌───────────────┴─────────┬───────┘               │               │   │
│       │  │                         │                       │               │   │
│       ▼  ▼                         ▼                       ▼               │   │
│  ┌───────────┐              ┌─────────────┐         (Uses inline          │   │
│  │  Expense  │              │  Balance    │          components)           │   │
│  │   Item    │              │    Row      │                                │   │
│  └───────────┘              └─────────────┘                                │   │
│       │                           │                                         │   │
│       │                           │                                         │   │
│       │                           ▼                                         │   │
│       │                    ┌──────────────┐                                │   │
│       │                    │ Settlement   │                                │   │
│       │                    │   Modal      │                                │   │
│       │                    └──────────────┘                                │   │
│       │                                                                     │   │
│       └─────────────────────────┬───────────────────────────────────┐     │   │
│                                 │                                   │     │   │
│                                 ▼                                   │     │   │
│                        ┌─────────────────┐                          │     │   │
│                        │   API Service   │                          │     │   │
│                        │  (api.ts)       │                          │     │   │
│                        │                 │                          │     │   │
│                        │  • groups.*     │                          │     │   │
│                        │  • groupExpenses│                          │     │   │
│                        └────────┬────────┘                          │     │   │
│                                 │                                   │     │   │
└─────────────────────────────────┼───────────────────────────────────┼─────────┘
                                  │                                   │
                        HTTP/JSON │                                   │
                                  │                                   │
┌─────────────────────────────────┼───────────────────────────────────┼─────────┐
│                                 │         BACKEND                   │         │
│                                 ▼                                   ▼         │
│                        ┌─────────────────┐                  ┌──────────────┐ │
│                        │  Express Routes │                  │  Controllers │ │
│                        │                 │                  │              │ │
│                        │ • /api/expenses │─────────────────▶│  expense.    │ │
│                        │ • /api/groups   │─────────────────▶│  controller  │ │
│                        │ • /api/settle-  │                  │              │ │
│                        │   ments         │                  │  group.      │ │
│                        └─────────────────┘                  │  controller  │ │
│                                                             └──────┬───────┘ │
│                                                                    │         │
│                                                                    ▼         │
│                                        ┌────────────────────────────────┐   │
│                                        │  Business Logic & Algorithms   │   │
│                                        │                                │   │
│                                        │  • calculateShares()           │   │
│                                        │  • buildBalanceRows()          │   │
│                                        │  • optimizeSettlementGraph()   │   │
│                                        │  • aggregateSummary()          │   │
│                                        └────────────┬───────────────────┘   │
│                                                     │                       │
│                                                     ▼                       │
│                                        ┌────────────────────┐               │
│                                        │  Mongoose Models   │               │
│                                        │                    │               │
│                                        │  • Group           │               │
│                                        │  • Expense         │               │
│                                        │  • Settlement      │               │
│                                        │  • User            │               │
│                                        └─────────┬──────────┘               │
│                                                  │                          │
└──────────────────────────────────────────────────┼──────────────────────────┘
                                                   │
                                                   ▼
                                        ┌────────────────────┐
                                        │     MongoDB        │
                                        │  (Database)        │
                                        │                    │
                                        │  Collections:      │
                                        │  • groups          │
                                        │  • expenses        │
                                        │  • settlements     │
                                        │  • users           │
                                        └────────────────────┘


═══════════════════════════════════════════════════════════════════════════════

DATA FLOW EXAMPLES:

1. EXPENSES TAB - Filtered List
   User → ExpensesTab → apiService.groupExpenses.getAll(groupId, { category: "Food" })
       → GET /api/expenses/group/:id?category=Food
       → expense.controller.getGroupExpenses()
       → Expense.find({ group: id, category: "Food" })
       → MongoDB Query
       ← Expense documents
       ← Controller response
       ← API response
   ← ExpensesTab renders ExpenseItem components

2. BALANCES TAB - Optimized Settlements
   User → BalancesTab → apiService.groups.getSettlements(groupId)
       → GET /api/groups/:id/settlements
       → group.controller.getGroupSettlements()
       → buildBalanceRows(expenses) → Calculate all balances
       → optimizeSettlementGraph(balances) → Greedy algorithm
       → Settlement.find({ group: id }) → Fetch history
       ← { optimizedSettlements, balanceRows, settlements }
   ← BalancesTab renders optimized cards + history

3. RECORD SETTLEMENT
   User → SettlementModal (fills form) → Submit
       → apiService.groups.recordSettlement(groupId, data)
       → POST /api/groups/:id/settlements { fromUserId, toUserId, amount }
       → group.controller.recordGroupSettlement()
       → new Settlement({ group, fromUser, toUser, amount })
       → settlement.save()
       ← Success response
   ← Modal closes, BalancesTab refreshes

4. SUMMARY TAB - Analytics
   User → SummaryTab → apiService.groups.getSummary(groupId)
       → GET /api/groups/:id/summary
       → group.controller.getGroupSummary()
       → Expense.find({ group: id })
       → Aggregate by category (reduce)
       → Aggregate by member (reduce)
       → Calculate percentages
       ← { totalExpenses, totalAmount, categoryBreakdown, memberContributions }
   ← SummaryTab renders charts and stats

═══════════════════════════════════════════════════════════════════════════════

COMPONENT HIERARCHY:

group/[id].tsx
├── Header (Group name, emoji, members count)
├── Trip Banner (if applicable)
├── Tab Bar (Expenses | Balances | Timeline | Summary)
└── Tab Content (dynamic)
    │
    ├── ExpensesTab
    │   ├── Filter Bar (search, category, paid by, sort)
    │   ├── FlatList
    │   │   └── ExpenseItem × N
    │   └── FAB (Add Expense)
    │
    ├── BalancesTab
    │   ├── Summary Card (your balance)
    │   ├── Optimized Settlements Section
    │   │   └── Settlement Card × N (with tap-to-record)
    │   ├── All Balances Section
    │   │   └── BalanceRow × N (with settle button)
    │   ├── Settlement History
    │   │   └── History Item × N
    │   └── SettlementModal (overlay)
    │
    ├── TimelineTab
    │   ├── Summary Card (days, expenses, total)
    │   └── FlatList
    │       └── Day Section × N (collapsible)
    │           └── ExpenseItem × N
    │
    └── SummaryTab
        ├── Stats Card (total, count, average)
        ├── Category Bar Chart
        ├── Member Contributions Chart
        └── Top Categories List

═══════════════════════════════════════════════════════════════════════════════

KEY ALGORITHMS:

┌──────────────────────────────────────────────────────────────────────────────┐
│  BALANCE CALCULATION                                                         │
│                                                                              │
│  For each expense:                                                           │
│    1. Add amount to payer's "paid"                                          │
│    2. Calculate share for each participant based on split type:             │
│       • equally: amount / participants.length                               │
│       • unequally: customAmounts[userId]                                    │
│       • percentage: amount * (percentage / 100)                             │
│       • shares: amount * (userShares / totalShares)                         │
│    3. Add share to each participant's "owedShare"                           │
│    4. Calculate net balance: paid - owedShare                               │
│                                                                              │
│  Result: Array<{ userId, userName, paid, owedShare, netBalance }>           │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  SETTLEMENT OPTIMIZATION (Greedy Algorithm)                                  │
│                                                                              │
│  Input: balances = [{ userId, netBalance }, ...]                            │
│                                                                              │
│  1. Separate into two groups:                                               │
│     creditors = users with netBalance > 0 (owed money)                      │
│     debtors = users with netBalance < 0 (owe money)                         │
│                                                                              │
│  2. Sort both arrays:                                                       │
│     creditors: descending by netBalance                                     │
│     debtors: ascending by netBalance (most negative first)                  │
│                                                                              │
│  3. Match highest creditor with highest debtor:                             │
│     while (creditors.length && debtors.length):                             │
│       amount = min(creditor.balance, abs(debtor.balance))                   │
│       settlements.push({ from: debtor, to: creditor, amount })              │
│       creditor.balance -= amount                                            │
│       debtor.balance += amount                                              │
│       if creditor.balance ≈ 0: remove from creditors                        │
│       if debtor.balance ≈ 0: remove from debtors                            │
│                                                                              │
│  Result: Minimal set of transactions to settle all balances                 │
│                                                                              │
│  Example:                                                                    │
│    Before: A owes B: 100, A owes C: 200, B owes C: 50                       │
│    After: A owes C: 250, B owes C: 50 (reduced from 3 to 2 transactions)   │
└──────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════

STATE MANAGEMENT:

┌─────────────────────────────────────────────────────────────────────────────┐
│  group/[id].tsx                                                             │
│  • activeTab: 'expenses' | 'balances' | 'timeline' | 'summary'             │
│  • group: Group | null                                                      │
│  • currentUserId: string                                                    │
│  • currentUserName: string                                                  │
│  • loading: boolean                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
                     │
                     ├─────────────────────────────────────────────────────┐
                     │                                                     │
┌────────────────────▼──────┐  ┌──────────────────▼────────┐              │
│  ExpensesTab              │  │  BalancesTab              │              │
│  • expenses: Expense[]    │  │  • balances: Balance[]    │              │
│  • loading: boolean       │  │  • settlements: Settlement│              │
│  • refreshing: boolean    │  │  • history: Settlement[]  │              │
│  • searchQuery: string    │  │  • modalState: object     │              │
│  • selectedCategory: str  │  │  • loading: boolean       │              │
│  • paidFilter: string     │  │  • refreshing: boolean    │              │
│  • sortBy: string         │  └───────────────────────────┘              │
│  • sortOrder: string      │                                              │
│  • showFilters: boolean   │                                              │
└───────────────────────────┘                                              │
                                                                           │
┌──────────────────────────┐  ┌────────────────────────────┐              │
│  TimelineTab             │  │  SummaryTab                │◀─────────────┘
│  • timelineData: Day[]   │  │  • summary: Summary | null │
│  • expandedDays: Set     │  │  • loading: boolean        │
│  • loading: boolean      │  └────────────────────────────┘
│  • refreshing: boolean   │
└──────────────────────────┘

Each tab manages its own data fetching and state!
No prop drilling, efficient re-renders.

═══════════════════════════════════════════════════════════════════════════════
```
