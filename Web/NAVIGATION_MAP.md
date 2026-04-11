# 🗺️ SmartSplit Web - Complete Navigation Map

## Site Structure Overview

```
SmartSplit Web App
│
├─ PUBLIC PAGES (No Authentication Required)
│  │
│  ├─ Landing Pages
│  │   ├─ / ................................. Home/Landing Page
│  │   │   └─ Components: Hero, Features, HowItWorks, Stats, Testimonials, Download, Footer
│  │   │   └─ Features: Beautiful hero with animations, feature cards grid, stats counters
│  │   │
│  │   ├─ /pricing ........................... Pricing Page
│  │   │   └─ Features: 3 pricing tiers (Free, Pro, Business), FAQ section
│  │   │
│  │   ├─ /about ............................ About Page
│  │   │   └─ Features: Mission, values, team info
│  │   │
│  │   └─ /contact .......................... Contact Page
│  │       └─ Features: Contact form, support info, office details
│  │
│  └─ Auth Pages
│     ├─ /login ............................ Login Page
│     │   └─ Features: Email/password login, Google OAuth, forgot password link
│     │
│     ├─ /register ......................... Register Page
│     │   └─ Features: Full registration form, terms checkbox, Google OAuth
│     │
│     └─ /forgot-password .................. Password Reset
│         └─ Features: Email input, reset link sending, success confirmation
│
│
├─ PROTECTED PAGES (Authentication Required)
│  └─ Dashboard Layout
│     ├─ Sidebar Navigation (Left)
│     ├─ Top Header with User Menu (Right)
│     └─ Main Content Area
│        │
│        ├─ Main Dashboard Pages
│        │  │
│        │  ├─ /dashboard .................. Dashboard Home
│        │  │   └─ Shows:
│        │  │       • Quick stats (Total expenses, You Owe, You're Owed, Budget Left)
│        │  │       • Quick action buttons (New Group, Add Expense, Settle Up, Analytics)
│        │  │       • Recent groups list
│        │  │
│        │  ├─ /groups .................... Groups List & Management
│        │  │   ├─ Shows: All groups in card grid
│        │  │   ├─ Features: View, Edit, Delete buttons
│        │  │   │
│        │  │   ├─ /groups/create ......... Create New Group
│        │  │   │   └─ Form: Group name, description, currency
│        │  │   │
│        │  │   └─ /groups/[id] .......... Group Detail Page
│        │  │       └─ Tabs Interface:
│        │  │           ├─ Expenses Tab
│        │  │           │  └─ Shows group expenses, add button
│        │  │           │  └─ Route: /groups/[id]/expenses
│        │  │           │
│        │  │           ├─ Balances Tab
│        │  │           │  └─ Member balances, settlement info
│        │  │           │  └─ Route: /groups/[id]/balances
│        │  │           │
│        │  │           ├─ Timeline Tab
│        │  │           │  └─ Activity history
│        │  │           │  └─ Route: /groups/[id]/timeline
│        │  │           │
│        │  │           └─ Settings Tab
│        │  │               └─ Group settings
│        │  │               └─ Route: /groups/[id]/settings
│        │  │
│        │  ├─ /personal ................. Personal Expenses
│        │  │   ├─ Shows: Monthly/weekly/daily spending, recent expenses
│        │  │   │
│        │  │   └─ /personal/add ......... Add Expense Form
│        │  │       └─ Form: Amount, category dropdown, description
│        │  │
│        │  ├─ /friends .................. Friends & Balances
│        │  │   ├─ Shows: Friend list with balance status
│        │  │   ├─ Actions: Message, Settle buttons
│        │  │   │
│        │  │   └─ /friends/[id] ........ Friend Detail
│        │  │       └─ Shows: Detailed balance info, transaction history
│        │  │
│        │  ├─ /settlements ............. Settlements Management
│        │  │   ├─ Shows: All settlements (pending/completed)
│        │  │   ├─ Features: Pay now button, status tracking
│        │  │   └─ Tabs: All, Pending, Completed
│        │  │
│        │  ├─ /analytics ............... Analytics Dashboard
│        │  │   ├─ Shows: Charts (Spending by category, Trends)
│        │  │   ├─ Features: Category breakdown with percentages
│        │  │   │
│        │  │   └─ /analytics/[category] ........ Category Analytics
│        │  │       └─ Shows: Detailed analytics for specific category
│        │  │
│        │  ├─ /budget .................. Budget Management
│        │  │   ├─ Shows: Monthly budget progress bar
│        │  │   ├─ Features: Category budgets with alerts
│        │  │   │
│        │  │   └─ /budget/set .......... Set Budgets
│        │  │       └─ Form: Budget amount per category
│        │  │
│        │  ├─ /notifications ........... Notifications
│        │  │   └─ Shows: Settlement alerts, budget warnings, expense updates
│        │  │
│        │  └─ /profile ................. User Profile
│        │      ├─ Shows: User info, account details
│        │      ├─ Actions: Edit profile, preferences, export data
│        │      │
│        │      ├─ /profile/edit ........ Edit Profile Form
│        │      │   └─ Form: Name, email, phone
│        │      │
│        │      ├─ /profile/preferences . Notification & Privacy Settings
│        │      │   └─ Toggles: Notifications, privacy settings
│        │      │
│        │      └─ /profile/export ...... Export Data
│        │          └─ Options: JSON, CSV, PDF, Receipts export
│        │
│        │
│        └─ Admin Panel (Web-Only)
│           │
│           ├─ /admin ................... Admin Dashboard
│           │   └─ Shows: System stats (Users, Groups, Revenue)
│           │
│           ├─ /admin/users ............ Users Management
│           │   ├─ Shows: User table with search
│           │   ├─ Columns: Name, Email, Status, Joined, Groups
│           │   └─ Features: Admin controls
│           │
│           ├─ /admin/groups .......... Groups Management
│           │   ├─ Shows: All groups with metrics
│           │   ├─ Columns: Group name, members, expenses, settled amount
│           │   └─ Features: Admin overview
│           │
│           └─ /admin/analytics ....... Platform Analytics
│               ├─ Shows: DAU, MAU, avg group size, revenue
│               └─ Features: Revenue charts, trends
│
│
└─ SPECIAL PAGES
   ├─ 404/not-found .................... Not Found Page (built-in)
   └─ Error Pages ....................... Error handling (built-in)
```

---

## 📊 Page Statistics

| Section | Count | Pages |
|---------|-------|-------|
| Public Pages | 4 | Landing, Pricing, About, Contact |
| Auth Pages | 3 | Login, Register, Forgot Password |
| Dashboard Main | 8 | Dashboard, Groups, Personal, Friends, Settlements, Analytics, Budget, Notifications |
| Dashboard/Profile | 3 | Profile, Edit, Preferences, Export |
| Group Sub-pages | 4 | Expenses, Balances, Timeline, Settings |
| Admin Pages | 4 | Dashboard, Users, Groups, Analytics |
| Related Pages | 7 | Create Group, Add Expense, Friend Detail, etc. |
| **TOTAL** | **35+** | **35+ Pages** |

---

## 🔐 Authentication Flow

```
User Visits SmartSplit
│
├─ Not Logged In?
│  ├─ Can Access: /, /pricing, /about, /contact
│  └─ Can Access: /login, /register, /forgot-password
│     └─ Auth pages redirect to /dashboard if already logged in
│
└─ Logged In?
   ├─ Can Access: All public pages (landing still shows dashboard button)
   ├─ Can Access: All /dashboard/* pages
   ├─ Can Access: All /profile/* pages
   ├─ Can Access: All admin pages (if admin role)
   └─ Login/Register redirects to /dashboard
```

---

## 🎯 User Journey Example

### New User Journey
```
1. Lands on / (Landing Page)
   ↓
2. Clicks "Get Started" or "Sign up"
   ↓
3. Goes to /register (Registration)
   ↓
4. Fills form and creates account
   ↓
5. Redirected to /dashboard
   ↓
6. Views personal dashboard
   ↓
7. Clicks "New Group" → /groups/create
   ↓
8. Creates first group
   ↓
9. Redirected to /groups
   ↓
10. Can now navigate to all features
```

### Existing User Journey
```
1. Lands on / (Landing Page)
   ↓
2. Clicks "Login" in navbar
   ↓
3. Goes to /login
   ↓
4. Enters credentials
   ↓
5. Redirected to /dashboard
   ↓
6. Can navigate everywhere based on sidebar
```

---

## 🧭 Component-to-Page Mapping

### Landing Page Components
```
Navbar           → Fixed top, auth state, navigation
  ├─ MobileMenu  → Mobile menu toggle
  └─ User Menu   → Login/Register/Profile dropdown

Body
  ├─ Hero        → Large headline with CTA
  ├─ Features    → 6 feature cards grid
  ├─ HowItWorks  → 3-step visual flow
  ├─ Stats       → Animated stat counters
  ├─ Testimonials → User testimonials carousel
  ├─ Download    → Mobile app download section
  └─ Footer      → Links and copyright

Dashboard Layout
  ├─ Sidebar     → Navigation menu
  └─ DashboardHeader → User menu, notifications
```

---

## 🔄 Route Hierarchy

```
Public Routes (/)
├── Marketing Routes (no /dashboard prefix)
│   ├── (marketing)/page.tsx          = /
│   ├── (marketing)/pricing/page.tsx  = /pricing
│   ├── (marketing)/about/page.tsx    = /about
│   └── (marketing)/contact/page.tsx  = /contact
│
├── Auth Routes (protected)
│   ├── (auth)/login/page.tsx         = /login
│   ├── (auth)/register/page.tsx      = /register
│   └── (auth)/forgot-password/page.tsx = /forgot-password
│
├── Dashboard Routes (protected)
│   └── (dashboard)/
│       ├── layout.tsx                = Shared layout
│       ├── dashboard/page.tsx        = /dashboard
│       ├── groups/page.tsx           = /groups
│       ├── groups/create/page.tsx    = /groups/create
│       ├── groups/[id]/page.tsx      = /groups/[id]
│       ├── groups/[id]/expenses/page.tsx = /groups/[id]/expenses
│       ├── groups/[id]/balances/page.tsx = /groups/[id]/balances
│       ├── groups/[id]/timeline/page.tsx = /groups/[id]/timeline
│       └── ... (and more)
│
└── Admin Routes (protected)
    └── admin/
        ├── page.tsx                  = /admin
        ├── users/page.tsx            = /admin/users
        ├── groups/page.tsx           = /admin/groups
        └── analytics/page.tsx        = /admin/analytics
```

---

## 🎨 Visual Layout Reference

### Landing Page Layout
```
┌─────────────────────────────────────────┐
│ Navbar (Sticky)                         │
├─────────────────────────────────────────┤
│                                         │
│  Hero Section                           │  ← Largest, eye-catching
│  (Headline + CTA + Phone mockup)        │
│                                         │
├─────────────────────────────────────────┤
│ Features (3x2 Grid)                      │  ← Cards with icons
├─────────────────────────────────────────┤
│ How It Works (3 steps)                   │  ← Flow diagram
├─────────────────────────────────────────┤
│ Stats (4 columns)                        │  ← Animated counters
├─────────────────────────────────────────┤
│ Testimonials (3 cards)                   │  ← User reviews
├─────────────────────────────────────────┤
│ Download Section                         │  ← Mobile app + QR
├─────────────────────────────────────────┤
│ Footer (Dark)                            │  ← Links hierarchy
└─────────────────────────────────────────┘
```

### Dashboard Layout
```
┌────────────────────────────────────────────┐
│ Header (Top)                               │
│ ├─ Mobile Menu Button                      │
│ ├─ Search / Notifications / User Menu      │
└────────────────────────────────────────────┘
┌─────────────┬───────────────────────────────┐
│             │                               │
│   Sidebar   │      Main Content Area        │
│             │                               │
│ - Dashboard │  Dashboard Page               │
│ - Groups    │     ├─ Stats Cards            │
│ - Personal  │     ├─ Quick Actions          │
│ - Friends   │     └─ Recent Items           │
│ - ...       │                               │
│             │  OR                           │
│             │                               │
│             │  Groups Page                  │
│             │     ├─ Header                 │
│             │     └─ Group Cards Grid       │
│             │                               │
└─────────────┴───────────────────────────────┘
```

---

## 📌 Key Navigation Points

### From Navbar (All pages)
- Logo → /
- Features link → Scroll to #features
- How it works → Scroll to #how-it-works
- Pricing → /pricing
- About → /about
- Login → /login
- Sign Up → /register
- Dashboard (if logged in) → /dashboard

### From Sidebar (Dashboard only)
- Dashboard icon → /dashboard
- Groups → /groups
- Personal → /personal
- Friends → /friends
- Settlements → /settlements
- Analytics → /analytics
- Budget → /budget
- Notifications → /notifications
- Profile → /profile
- Logout → Sign out

---

## ✅ All Pages At a Glance

- [x] / - Landing page with hero and features
- [x] /pricing - 3-tier pricing with FAQ
- [x] /about - Company mission and values
- [x] /contact - Contact form
- [x] /login - Login form with OAuth
- [x] /register - Registration form
- [x] /forgot-password - Password reset
- [x] /dashboard - Main dashboard home
- [x] /groups - Groups list
- [x] /groups/create - Create group form
- [x] /groups/[id] - Group detail with tabs
- [x] /groups/[id]/expenses - Group expenses view
- [x] /groups/[id]/balances - Member balance view
- [x] /groups/[id]/timeline - Activity timeline
- [x] /groups/[id]/settings - Group settings
- [x] /personal - Personal expenses list
- [x] /personal/add - Add expense form
- [x] /friends - Friends list with balances
- [x] /friends/[id] - Friend detail page
- [x] /settlements - All settlements view
- [x] /analytics - Analytics dashboard
- [x] /analytics/[category] - Category analytics
- [x] /budget - Budget management
- [x] /budget/set - Set budget form
- [x] /notifications - Notifications feed
- [x] /profile - User profile
- [x] /profile/edit - Edit profile form
- [x] /profile/preferences - Notification settings
- [x] /profile/export - Export data options
- [x] /admin - Admin dashboard
- [x] /admin/users - Users management
- [x] /admin/groups - Groups management
- [x] /admin/analytics - Platform analytics

**Total: 35+ Pages ✅**

---

This map shows your complete web app structure. Everything is built and ready for backend integration!
