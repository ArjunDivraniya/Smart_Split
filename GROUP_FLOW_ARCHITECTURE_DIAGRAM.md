# GROUP FLOW - VISUAL ARCHITECTURE & INTEGRATION MAP

## System Architecture Diagram

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                         SMART SPLIT - GROUP FLOW SYSTEM                        ║
╚════════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────────┐
│                            MOBILE APP (React Native + Expo)                      │
│                                   PORT 8082                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ SCREENS                                                                 │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │   │
│  │  │  Groups List     │  │  Create Wizard   │  │  Group Detail    │    │   │
│  │  │  (groups.tsx)    │  │  (create.tsx)    │  │  ([id].tsx)      │    │   │
│  │  │                  │  │                  │  │                  │    │   │
│  │  │ • [+] Button     │  │ Step 1: Type ────┼─→ • Tabs            │    │   │
│  │  │ • FlatList       │  │ Step 2: Details  │  │ • Members        │    │   │
│  │  │ • GroupCard      │  │ Step 3: Trip/    │  │ • Expenses       │    │   │
│  │  │ • Empty state    │  │        Review    │  │ • Timeline       │    │   │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘    │   │
│  │         ↑ GET /api/groups        ↓ POST /api/groups        ↑        │   │
│  │                                                    GET /api/groups/:id │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                          ↑                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ API SERVICE (api.ts)                                                    │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │ • apiService.groups.getAll()                                            │   │
│  │ • apiService.groups.getById(id)                                         │   │
│  │ • apiService.groups.create(data)  ← Used by create.tsx                 │   │
│  │ • apiService.groups.update(id, data)                                    │   │
│  │ • apiService.groups.delete(id)                                          │   │
│  │ • apiService.groups.getTimeline(id)                                     │   │
│  │ • apiService.groups.getSettlements(id)                                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                   ↓ axios + JWT interceptor ↓                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ AXIOS INSTANCE (baseURL: http://localhost:5000/api)                     │   │
│  │ • Auto-attaches JWT token from AsyncStorage                             │   │
│  │ • Handles 401 Unauthorized responses                                    │   │
│  │ • Debug logging enabled                                                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ HTTP REQUEST to Backend                                                 │   │
│  │ POST http://localhost:5000/api/groups                                   │   │
│  │ Headers: { Authorization: "Bearer eyJhbG..." }                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                            │
└──────────────────────────────────────────────────────────────────────────────────┘
                                      ║ Network ║
                                      ║ Request ║
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND (Node.js + Express)                              │
│                                   PORT 5000                                       │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │ EXPRESS ROUTER (server.ts)                                             │    │
│  ├────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                         │    │
│  │  POST   /api/groups    ────────┐                                      │    │
│  │  GET    /api/groups    ────────┤                                      │    │
│  │  GET    /api/groups/:id ──────→ group.routes.ts                       │    │
│  │  PUT    /api/groups/:id ──────┤  (routes registration)                │    │
│  │  DELETE /api/groups/:id ──────┘                                      │    │
│  │  GET    /api/groups/:id/settlements                                   │    │
│  │  GET    /api/groups/:id/timeline                                      │    │
│  │                                                                         │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
│                                    ↓                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │ MIDDLEWARE CHAIN                                                       │    │
│  ├────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                         │    │
│  │  1. Express.json()       - Parse JSON body                            │    │
│  │  2. authenticateToken    - Validate JWT & extract userId             │    │
│  │  3. Router match        - Match to correct route handler             │    │
│  │                                                                         │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
│                                    ↓                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │ CONTROLLERS (group.controller.ts)                                      │    │
│  ├────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                         │    │
│  │  ┌──────────────────────────────────────────────────────────────┐    │    │
│  │  │ createGroup()                                                │    │    │
│  │  │ ├─ Validate user ID from JWT                               │    │    │
│  │  │ ├─ Validate request body (name, type, emoji)               │    │    │
│  │  │ ├─ Validate trip dates if type === 'trip'                 │    │    │
│  │  │ ├─ Fetch user from database                                │    │    │
│  │  │ ├─ Create Group document with creator as member           │    │    │
│  │  │ ├─ Save to MongoDB                                         │    │    │
│  │  │ └─ Return 201 with group ID                               │    │    │
│  │  └──────────────────────────────────────────────────────────────┘    │    │
│  │                                                                         │    │
│  │  ┌──────────────────────────────────────────────────────────────┐    │    │
│  │  │ getUserGroups()                                              │    │    │
│  │  │ ├─ Extract userId from JWT                                  │    │    │
│  │  │ ├─ Query: createdBy === userId OR members contains userId    │    │    │
│  │  │ ├─ Return array of group objects                             │    │    │
│  │  └──────────────────────────────────────────────────────────────┘    │    │
│  │                                                                         │    │
│  │  ┌──────────────────────────────────────────────────────────────┐    │    │
│  │  │ getGroupById() / updateGroup() / deleteGroup()               │    │    │
│  │  │ [Similar authorization and validation logic]                  │    │    │
│  │  └──────────────────────────────────────────────────────────────┘    │    │
│  │                                                                         │    │
│  │  ┌──────────────────────────────────────────────────────────────┐    │    │
│  │  │ getGroupSettlements() / getGroupTimeline()                   │    │    │
│  │  │ [Returns calculated data for trips]                           │    │    │
│  │  └──────────────────────────────────────────────────────────────┘    │    │
│  │                                                                         │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
│                                    ↓                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │ MONGOOSE MODELS (models/Group.model.ts)                                │    │
│  ├────────────────────────────────────────────────────────────────────────┤    │
│  │                                                                         │    │
│  │  GroupSchema:                                                          │    │
│  │  ├─ name: String (required)                                           │    │
│  │  ├─ type: Enum 'trip'|'college'|'food'|'flatmates'|'event'|'custom'   │    │
│  │  ├─ emoji: String (required)                                          │    │
│  │  ├─ description: String (optional)                                    │    │
│  │  ├─ createdBy: ObjectId (User ref)                                   │    │
│  │  ├─ members: Array [{userId, userName, email, role}]                 │    │
│  │  ├─ expenses: Array [ObjectId refs]                                  │    │
│  │  ├─ tripStartDate, tripEndDate, tripDestination, tripBudget         │    │
│  │  ├─ totalSpent, netBalance                                           │    │
│  │  ├─ isActive: Boolean (default: true)                                │    │
│  │  └─ Indexes: createdBy, members.userId, type                         │    │
│  │                                                                         │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
│                                    ↓                                             │
└──────────────────────────────────────────────────────────────────────────────────┘
                                      ║ Database ║
                                      ║ Operation ║
┌──────────────────────────────────────────────────────────────────────────────────┐
│                            MONGODB DATABASE                                       │
│                            Connection: mongoose://...                             │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  Database: smartsplit_db                                                        │
│  └─ Collection: groups                                                           │
│     └─ Documents: [                                                              │
│        {                                                                         │
│          _id: ObjectId,                                                          │
│          name: "Weekend Trip to Goa",                                           │
│          type: "trip",                                                           │
│          emoji: "✈️",                                                            │
│          ...all fields...                                                        │
│        },                                                                        │
│        { ...more documents... }                                                 │
│     ]                                                                            │
│                                                                                   │
│  Indexes:                                                                        │
│  └─ { createdBy: 1 }         - Find groups by creator                           │
│  └─ { "members.userId": 1 }  - Find groups by member                            │
│  └─ { type: 1 }              - Find groups by type                              │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
                                      ║
                                      ║ Returns
                                      ║ Document
                                      ↓

┌──────────────────────────────────────────────────────────────────────────────────┐
│                    RESPONSE SENT BACK TO MOBILE                                  │
│                                                                                   │
│  HTTP 201 Created                                                                │
│  {                                                                               │
│    "success": true,                                                              │
│    "message": "Group created successfully",                                      │
│    "data": {                                                                     │
│      "id": "507f1f77bcf86cd799439011",                                          │
│      "name": "Weekend Trip to Goa",                                             │
│      "type": "trip",                                                             │
│      "emoji": "✈️",                                                              │
│      ... all 20+ fields ...                                                      │
│    }                                                                             │
│  }                                                                               │
│                         ↓                                                        │
│  Mobile App:                                                                     │
│  ├─ Extract response.data.id                                                    │
│  ├─ Navigate to /group/{id}                                                     │
│  └─ Display group detail screen                                                 │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Request/Response Cycle - Sequence Diagram

```
User                    Mobile App              Backend             MongoDB
 │                          │                       │                  │
 │ Click [+] Create         │                       │                  │
 ├──────────────────────────→│                       │                  │
 │                          │ Navigate to           │                  │
 │                          │ /group/create         │                  │
 │                          │ (show form)           │                  │
 │ Fill form &              │                       │                  │
 │ click Create             │                       │                  │
 ├──────────────────────────→│                       │                  │
 │                          │ POST /api/groups      │                  │
 │                          │ with form data        │                  │
 │                          ├──────────────────────→│                  │
 │                          │ + JWT token           │                  │
 │                          │                       │ Validate JWT     │
 │                          │                       ├─────────┐        │
 │                          │                       │←────────┘        │
 │                          │                       │ Check auth ✓     │
 │                          │                       │                  │
 │                          │                       │ Validate data    │
 │                          │                       │ (dates, required)│
 │                          │                       │                  │
 │                          │                       │ CreateGroup()    │
 │                          │                       │                  │
 │                          │                       │ Save to DB       │
 │                          │                       ├─────────────────→│
 │                          │                       │                  │
 │                          │                       │  Save complete   │
 │                          │                       │←─────────────────┤
 │                          │                       │                  │
 │                          │ 201 Created           │                  │
 │                          │ {data: {...}}         │                  │
 │                          │←──────────────────────┤                  │
 │                          │                       │                  │
 │ Success alert            │ Extract ID            │                  │
 │                          │ Redirect to           │                  │
 │←─────────────────────────┤ /group/{id}           │                  │
 │                          │ Load details          │                  │
 │See group detail          │                       │                  │
 │                          │ GET /api/groups/{id}  │                  │
 │                          ├──────────────────────→│                  │
 │                          │                       │ Query by ID      │
 │                          │                       ├─────────────────→│
 │                          │                       │                  │
 │                          │                       │ Return document  │
 │                          │                       │←─────────────────┤
 │                          │ 200 OK                │                  │
 │                          │ {data: {...}}         │                  │
 │                          │←──────────────────────┤                  │
 │                          │                       │                  │
 │                          │ Render detail page    │                  │
 │ See new group displayed  │                       │                  │
 │←────────────────────────←┤                       │                  │
 │                          │                       │                  │
```

---

## File Organization

```
SMART_SPLIT/
│
├── Backend/
│   ├── src/
│   │   ├── server.ts                      [UPDATED]
│   │   │   └── import groupRoutes
│   │   │   └── app.use('/api/groups', groupRoutes)
│   │   │
│   │   ├── models/
│   │   │   └── Group.model.ts             [CREATED]
│   │   │       └── Full schema with indexes
│   │   │
│   │   ├── controllers/
│   │   │   └── group.controller.ts        [CREATED ✅]
│   │   │       ├── createGroup()
│   │   │       ├── getUserGroups()
│   │   │       ├── getGroupById()
│   │   │       ├── updateGroup()
│   │   │       ├── deleteGroup()
│   │   │       ├── getGroupSettlements()
│   │   │       └── getGroupTimeline()
│   │   │
│   │   ├── routes/
│   │   │   └── group.routes.ts            [CREATED ✅]
│   │   │       ├── POST /api/groups
│   │   │       ├── GET /api/groups
│   │   │       ├── GET /api/groups/:id
│   │   │       ├── PUT /api/groups/:id
│   │   │       ├── DELETE /api/groups/:id
│   │   │       ├── GET /api/groups/:id/settlements
│   │   │       └── GET /api/groups/:id/timeline
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts         [USED by routes]
│   │   │
│   │   └── ...other files...
│   │
│   └── package.json (no new dependencies needed)
│
├── Mobile-App/
│   ├── app/
│   │   ├── _layout.tsx                    [UPDATED]
│   │   │   └── Added: group route to Stack
│   │   │
│   │   ├── (tabs)/
│   │   │   └── groups.tsx                 [USES apiService.groups.getAll()]
│   │   │
│   │   └── group/
│   │       ├── _layout.tsx                [CREATED ✅]
│   │       │   └── Stack layout for group routes
│   │       │
│   │       ├── create.tsx                 [USES apiService.groups.create()]
│   │       │   └── 3-step wizard form
│   │       │
│   │       └── [id].tsx                   [USES apiService.groups.getById()]
│   │           └── Group detail screen
│   │
│   └── src/
│       ├── services/
│       │   ├── api.ts                     [READY ✅]
│       │   │   └── apiService.groups.* methods:
│       │   │       ├── getAll()
│       │   │       ├── getById(id)
│       │   │       ├── create(data)
│       │   │       ├── update(id, data)
│       │   │       ├── delete(id)
│       │   │       ├── addExpense(id, data)
│       │   │       ├── removeExpense(id, expenseId)
│       │   │       ├── getTimeline(id)
│       │   │       └── getSettlements(id)
│       │   │
│       │   └── index.ts
│       │
│       ├── types/
│       │   └── group.types.ts             [READY ✅]
│       │       ├── GroupType enum
│       │       ├── Group interface
│       │       └── CreateGroupFormData interface
│       │
│       ├── utils/
│       │   └── tripDayCalculator.ts       [READY ✅]
│       │       └── 6 utility functions for trip math
│       │
│       └── components/
│           └── groups/
│               ├── GroupTypeSelector.tsx  [READY ✅]
│               ├── TripDatePicker.tsx     [READY ✅]
│               ├── TimelineTab.tsx        [READY ✅]
│               └── GroupCard.tsx          [READY ✅]
│
└── Documentation/
    ├── GROUP_FLOW_BACKEND_INTEGRATION.md  [CREATED - Detailed guide]
    ├── GROUP_BACKEND_QUICK_START.md       [CREATED - Quick reference]
    └── GROUP_FLOW_COMPLETION_SUMMARY.md   [CREATED - Full summary]
```

---

## Data Model Relationship

```
User (from auth)
  │
  ├──creates──→ Group
  │               │
  │               ├─ name, type, emoji
  │               ├─ members: [{userId, ...}]
  │               ├─ expenses: [Expense._id]
  │               │
  │               └─ If TRIP:
  │                   ├─ startDate, endDate
  │                   ├─ destination
  │                   ├─ budget
  │                   └─ trackBudget
  │
  └──has–many──→ Expense
                  │
                  ├─ amount
                  ├─ description
                  ├─ category
                  └─ paidBy: userId
```

---

## Authentication Flow

```
User Login
   │
   ├─ POST /api/auth/login
   │ ├─ Validate email/password
   │ └─ Generate JWT token
   │
   ↓
JWT Token stored in:
   ├─ AsyncStorage: '@auth_token'
   └─ Memory (in app context)
   │
   ↓
Every API Request:
   ├─ axios interceptor adds header:
   │ └─ Authorization: Bearer {token}
   │
   ↓
Backend Receipt:
   ├─ authenticateToken middleware
   ├─ Verify JWT signature
   ├─ Extract userId
   └─ Attach to req.user.userId
   │
   ↓
Controller Access:
   └─ const userId = (req as any).user?.userId
```

---

## Error Handling Flow

```
Frontend Request
   │
   ├─ Validation Error (empty name, wrong dates)
   │  └─ Alert to user before sending
   │
   ├─ Send Request
   │  └─ Network Error
   │     ├─ Connection refused
   │     └─ Offline
   │
   ↓
Backend Response
   │
   ├─ 201/200 - Success
   │  └─ Process response, navigate
   │
   ├─ 400 - Bad Request
   │  ├─ Invalid data
   │  └─ Show: error.response.data.error
   │
   ├─ 401 - Unauthorized
   │  ├─ Token missing/invalid/expired
   │  └─ Clear token, redirect to login
   │
   ├─ 403 - Forbidden
   │  ├─ Not authorized (not creator)
   │  └─ Show: "Only creator can do this"
   │
   ├─ 404 - Not Found
   │  ├─ Group doesn't exist
   │  └─ Show: "Group not found"
   │
   └─ 500 - Server Error
      ├─ Database error
      └─ Show: "Something went wrong"
```

---

## Summary of Integration

| Layer | Component | Status | Purpose |
|-------|-----------|--------|---------|
| **Frontend** | create.tsx | ✅ Ready | Calls `apiService.groups.create()` |
| | groups.tsx | ✅ Ready | Calls `apiService.groups.getAll()` |
| | [id].tsx | ✅ Ready | Calls `apiService.groups.getById()` |
| **API Service** | axios instance | ✅ Ready | HTTP client with JWT interceptor |
| | group endpoints | ✅ Ready | 8 endpoints defined |
| **Backend Routes** | group.routes.ts | ✅ CREATED | Maps 7 endpoints to handlers |
| | server.ts | ✅ UPDATED | Registers group routes |
| **Controllers** | group.controller.ts | ✅ CREATED | Implements 7 operation handlers |
| **Models** | Group.model.ts | ✅ Created | MongoDB schema |
| **Database** | MongoDB | ✅ Connected | Persists group data |

---

Everything is now fully integrated and ready to use! 🚀
