# 🏷️ SmartSplit - Expense Management & Trip Planning Platform

> A comprehensive, full-stack application for splitting expenses, planning trips, managing budgets, and settling debts with friends. Available on **Mobile (iOS/Android)**, **Web**, and as a **Marketing Landing Page**.

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Setup](#-quick-setup)
- [📱 Mobile App Setup](#-mobile-app-setupios--android)
- [🌐 Web App Setup](#-web-app-setup)
- [🖥️ Backend Setup](#-backend-setup)
- [🎨 Marketing Page Setup](#-marketing-page-setup)
- [🔗 API Documentation](#-api-documentation)
- [💾 Database Schema](#-database-schema)
- [📦 Deployment](#-deployment)
- [📚 Key Documentation](#-key-documentation)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Overview

**SmartSplit** is a full-stack expense management platform designed to help groups, friends, and travelers split expenses fairly and track debts easily. Whether you're planning a trip, sharing a household, or settling group expenses, SmartSplit provides an intuitive interface and powerful algorithms to simplify expense sharing.

### Who This Is For:
- 👥 Friends splitting bills
- 🏖️ Travel groups planning trips
- 🏠 Roommates managing household expenses
- 👨‍👩‍👧‍👦 Family expense tracking
- 💰 Anyone managing group finances

---

## ✨ Features

### 🎂 Core Features

#### Expense Management
- ✅ **Smart Expense Splitting**: Equal, unequal, percentage, and share-based splits
- ✅ **Multiple Payment Methods**: UPI, Cash, Card payments
- ✅ **Expense Categories**: Organize by food, transport, accommodation, activities, etc.
- ✅ **Recurring Expenses**: Set up automatic recurring expenses
- ✅ **Expense History**: Complete transaction history with filtering

#### Trip Planning & Management
- 🗺️ **Trip Planning**: Create trips with destination, dates, and budgets
- 👥 **Member Management**: Add members, send invitations, track RSVP status
- 📋 **Activity Planning**: Plan and track trip itineraries
- 🎒 **Packing Lists**: Collaborative packing checklists
- 💬 **Trip Chat**: In-app messaging with group members
- 📊 **Trip Analytics**: Spending breakdown by category and member

#### Settlement & Debt Management
- 🧮 **Smart Settlement Calculation**: Advanced direct debt netting algorithm
- 🏦 **Settlement Optimization**: Minimizes number of transactions needed
- 📊 **Multiple Settlement Views**: See who owes whom at a glance
- ✅ **Settlement Tracking**: Mark debts as paid and settled
- 🔄 **Direct Payment Links**: Share settlement payment links

#### Budgeting & Analytics
- 💰 **Budget Setting**: Set and track group/personal budgets
- 📈 **Analytics Dashboard**: Visual spending breakdown and trends
- 👤 **Member Analysis**: Per-member contribution tracking
- 📊 **Category Breakdown**: See spending by category over time
- 🎯 **Budget Alerts**: Get notified when budget limits are exceeded

#### Friends & Social
- 👥 **Friends List**: Add and manage friends
- 💬 **Direct Settlements**: Settle money between specific friends
- 🔗 **Friend Profiles**: View friend's info and history
- 📲 **Notification System**: Real-time notifications for all events
- 📤 **Share & Invite**: Share groups and get referrals

#### User Profile & Settings
- 👤 **Profile Management**: Upload and manage profile information
- 🎨 **Preferences**: Customize themes, notifications, privacy settings
- 📱 **Device Management**: Sync across devices
- 🔐 **Security**: JWT authentication with secure password storage
- 📤 **Data Export**: Export expense history as PDF/CSV

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js v16+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Atlas recommended)
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Development**: Nodemon
- **Process Management**: PM2 (production)

**Key Libraries:**
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT handling
- `multer` - File uploads
- `cors` - Cross-origin resource sharing
- `helmet` - Security headers
- `dotenv` - Environment variables

### Mobile App (iOS/Android)
- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Language**: TypeScript
- **State Management**: React Context API
- **UI Components**: Custom components with React Native
- **API Client**: Fetch API with custom service layer
- **Styling**: Native stylesheet + theme system
- **Fonts**: Expo-fonts (Syne, DM Sans)

**Key Libraries:**
- `expo-router` - File-based routing
- `@react-native-async-storage/async-storage` - Local storage
- `expo-notifications` - Push notifications
- `expo-document-picker` - File selection
- `victory-native` - Charts and analytics

### Web App
- **Framework**: Next.js 14+
- **Language**: TypeScript
- **Styling**: Tailwind CSS / CSS Modules
- **UI Components**: Custom React components
- **State Management**: React Context
- **Authentication**: JWT with localStorage
- **API Client**: Fetch / Axios

### Marketing Landing Page
- **Framework**: Next.js 14+
- **Language**: TypeScript
- **Styling**: CSS Modules / Tailwind
- **Animation**: Framer Motion
- **Components**: Custom React components with interactive features

---

## 📁 Project Structure

```
SmartSplit/
│
├── Backend/                          # 🖥️ Node.js/Express REST API
│   ├── src/
│   │   ├── config/                   # Configuration files
│   │   │   ├── database.ts           # MongoDB connection
│   │   │   └── cloudinary.ts         # File upload setup
│   │   ├── controllers/              # Business logic
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── group.controller.ts   # Groups/Trips management
│   │   │   ├── expense.controller.ts
│   │   │   ├── settlement.controller.ts
│   │   │   ├── analytics.controller.ts
│   │   │   ├── notification.controller.ts
│   │   │   ├── chat.controller.ts
│   │   │   └── itinerary.controller.ts
│   │   ├── models/                   # MongoDB schemas
│   │   │   ├── User.model.ts
│   │   │   ├── Group.model.ts        # Groups/Trips
│   │   │   ├── Expense.model.ts
│   │   │   ├── Notification.model.ts
│   │   │   ├── Activity.model.ts
│   │   │   └── Message.model.ts
│   │   ├── routes/                   # API endpoints
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── group.routes.ts       # Group endpoints
│   │   │   ├── expense.routes.ts
│   │   │   └── notification.routes.ts
│   │   ├── middleware/               # middlewares
│   │   │   ├── auth.middleware.ts    # JWT verification
│   │   │   ├── errorHandler.ts       # Error handling
│   │   │   └── upload.middleware.ts  # File uploads
│   │   ├── utils/
│   │   │   ├── settlement.ts         # Debt calculation algorithm
│   │   │   └── notification.ts       # Notification helpers
│   │   └── server.ts                 # Express app setup
│   │
│   ├── package.json                  # Dependencies
│   ├── tsconfig.json                 # TypeScript config
│   ├── nodemon.json                  # Dev watch config
│   ├── README.md                     # Backend documentation
│   ├── SETUP.md                      # Backend setup guide
│   └── RENDER_DEPLOYMENT.md          # Deployment guide
│
├── Mobile-App/                       # 📱 React Native/Expo
│   ├── app/                          # File-based routing
│   │   ├── _layout.tsx               # Root layout
│   │   ├── index.tsx                 # Home screen
│   │   ├── (auth)/                   # Auth screens
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── onboarding.tsx
│   │   ├── (tabs)/                   # Main tab navigation
│   │   │   ├── index.tsx             # Home/Dashboard
│   │   │   ├── groups.tsx            # Groups list
│   │   │   ├── friends.tsx           # Friends list
│   │   │   └── analytics.tsx         # Analytics view
│   │   ├── group/                    # Group screens
│   │   │   ├── [id].tsx              # Group details
│   │   │   ├── create.tsx            # Create group
│   │   │   ├── add-expense.tsx       # Add expense
│   │   │   └── expense/[id].tsx      # Expense details
│   │   ├── personal/                 # Personal expenses
│   │   ├── budget/                   # Budget management
│   │   ├── settlements/              # Settlement screens
│   │   ├── notifications.tsx         # Notifications
│   │   └── profile/                  # Profile screens
│   │
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   ├── services/                 # API services
│   │   ├── utils/                    # Utility functions
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── context/                  # React context
│   │   └── types/                    # TypeScript types
│   │
│   ├── assets/                       # Images, fonts, logos
│   ├── package.json
│   ├── tsconfig.json
│   ├── app.json                      # Expo config
│   ├── eas.json                      # EAS Build config
│   ├── README.md                     # Mobile app docs
│   └── SCREEN_TITLES_GUIDE.md        # Screen styling guide
│
├── Web/                              # 🌐 Next.js Web App
│   ├── app/                          # Next.js app directory
│   │   ├── page.tsx                  # Home page
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Global styles
│   │   └── [collection]/             # Dynamic routes
│   │
│   ├── src/
│   │   ├── components/               # React components
│   │   ├── pages/                    # Page components
│   │   ├── services/                 # API services
│   │   └── utils/                    # Utilities
│   │
│   ├── public/                       # Static files
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── tailwind.config.ts            # Tailwind config
│   ├── README.md
│   └── INTEGRATION_GUIDE.md          # API integration guide
│
├── smartsplit-app-page/              # 🎨 Marketing Landing Page
│   ├── app/                          # Next.js pages
│   │   ├── page.tsx                  # Landing page
│   │   ├── layout.tsx                # Layout
│   │   └── globals.css               # Styles
│   │
│   ├── components/                   # Page components
│   │   ├── Hero.tsx                  # Hero section
│   │   ├── Features.tsx              # Features showcase
│   │   ├── HowItWorks.tsx            # How it works section
│   │   ├── Download.tsx              # Download buttons
│   │   ├── Navbar.tsx                # Navigation
│   │   └── Footer.tsx                # Footer
│   │
│   ├── public/                       # Assets
│   ├── package.json
│   ├── next.config.ts
│   ├── README.md
│   └── smartsplit-ui-guide.html      # UI component guide
│
├── PROJECT_COMPLETION_STATUS.md     # 📊 Project status
├── SCREEN_TITLES_COMPREHENSIVE_AUDIT.md
└── README.md                         # This file
```

---

## 🚀 Quick Setup

### Prerequisites
- **Node.js** v16+ and npm/yarn
- **MongoDB Atlas** account (or local MongoDB)
- **Cloudinary** account for file uploads
- **Expo CLI** (for mobile development)
- **Git** for version control

### Clone Repository
```bash
git clone https://github.com/your-username/smartsplit.git
cd smartsplit
```

---

## 📱 Mobile App Setup (iOS & Android)

### Prerequisites
- Node.js v16+
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (macOS only) or Expo Go app
- Android: Android Studio or Expo Go app

### Installation

```bash
cd Mobile-App

# Install dependencies
npm install

# Install Expo fonts
npx expo install expo-font

# Start development server
npm run dev

# Or start with Expo
expo start
```

### Running on Devices
```bash
# Press 'i' to open in iOS Simulator
# Press 'a' to open in Android Emulator
# Press 'w' to open in web browser
# Scan QR code with Expo Go app (iOS/Android)
```

### Building for Production
```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both
eas build
```

**Documentation**: [See Mobile-App/README.md](Mobile-App/README.md)

---

## 🌐 Web App Setup

### Installation

```bash
cd Web

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local with your API endpoints
# NEXT_PUBLIC_API_URL=http://localhost:5000

# Start development server
npm run dev
```

### Build & Deploy
```bash
# Build for production
npm run build

# Start production server
npm start
```

**Documentation**: [See Web/README.md](Web/README.md) and [Web/INTEGRATION_GUIDE.md](Web/INTEGRATION_GUIDE.md)

---

## 🖥️ Backend Setup

### Installation

```bash
cd Backend

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Edit .env with your configuration
```

### Environment Variables (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartsplit

# JWT
JWT_SECRET=your-super-secret-key-here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:8081,exp://localhost:8081,https://your-frontend.com

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Development Server
```bash
# Start with hot reload (nodemon)
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start
```

### MongoDB Setup
```bash
# Using MongoDB Atlas (Recommended)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Set MONGODB_URI in .env

# Or use local MongoDB
mongod
```

### Cloudinary Setup
```
1. Sign up at https://cloudinary.com
2. Dashboard → Settings → Copy credentials
3. Set CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET in .env
```

**Documentation**: 
- [See Backend/README.md](Backend/README.md)
- [See Backend/SETUP.md](Backend/SETUP.md)

---

## 🎨 Marketing Page Setup

### Installation

```bash
cd smartsplit-app-page

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

**Documentation**: [See smartsplit-app-page/README.md](smartsplit-app-page/README.md)

---

## 🔗 API Documentation

### Base URL
```
Development: http://localhost:5000
Production: https://your-api-domain.com
```

### Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### API Endpoints Overview

#### Authentication (2 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email/password |

#### Users (4 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/update` | Update profile |
| GET | `/api/users/search?query=` | Search users |
| POST | `/api/users/upload-profile` | Upload profile image |

#### Groups (18 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/groups/create` | Create new group |
| GET | `/api/groups` | Get user's groups |
| GET | `/api/groups/:id` | Get group details |
| POST | `/api/groups/:id/add-member` | Add member to group |
| DELETE | `/api/groups/:id/members/:memberId` | Remove member |
| GET | `/api/groups/:id/settlements` | Get settlement calculations |
| GET | `/api/groups/:id/analytics` | Get analytics data |
| DEL | `/api/groups/:id` | Delete group |
| POST | `/api/groups/:id/edit` | Edit group details |
| POST | `/api/groups/:id/respond` | Respond to invitation |
| GET | `/api/groups/:id/itinerary` | Get trip itinerary |
| POST | `/api/groups/:id/itinerary` | Add itinerary items |
| GET | `/api/groups/:id/chat` | Get group messages |
| POST | `/api/groups/:id/chat` | Send message |

#### Expenses (3 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/expenses/add` | Add expense to group |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |

#### Notifications (2 endpoints)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |

**Full API Documentation**: [See Backend/README.md](Backend/README.md)

---

## 💾 Database Schema

### Collections Overview

#### Users Collection
```typescript
{
  _id: ObjectId
  email: string (unique)
  name: string
  phone: string
  profileImage: string (Cloudinary URL)
  avatar: string
  upiId: string
  password: string (hashed)
  friends: [ObjectId]
  groups: [ObjectId]
  createdAt: Date
}
```

#### Groups Collection
```typescript
{
  _id: ObjectId
  name: string
  description: string
  type: string ("trip" | "group")
  emoji: string
  location: string
  currency: string
  createdBy: ObjectId (User reference)
  members: [
    {
      userId: ObjectId (User reference)
      status: string ("pending" | "accepted" | "declined")
      joinedAt: Date
    }
  ]
  expenses: [ObjectId] (Expense references)
  totalSpent: number
  budget: number
  startDate: Date
  endDate: Date
  activities: [ObjectId]
  message: [ObjectId]
  createdAt: Date
}
```

#### Expenses Collection
```typescript
{
  _id: ObjectId
  groupId: ObjectId (Group reference)
  paidBy: ObjectId (User reference)
  amount: number
  category: string
  description: string
  splitType: string ("equal" | "unequal" | "percentage" | "shares")
  splits: [
    {
      userId: ObjectId
      amount: number
    }
  ]
  date: Date
  createdAt: Date
}
```

#### Notifications Collection
```typescript
{
  _id: ObjectId
  userId: ObjectId (User reference)
  type: string ("expense" | "settlement" | "invite" | "message")
  groupId: ObjectId
  title: string
  message: string
  read: boolean
  data: object
  createdAt: Date
}
```

---

## 📦 Deployment

### Backend Deployment to Render

**Prerequisites:**
- GitHub account with code pushed
- Render account (https://render.com)
- MongoDB Atlas account
- Cloudinary account

**Steps:**

1. **Create Render Service**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - Name: `smartsplit-backend`
   - Environment: Node
   - Root Directory: `Backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Set Environment Variables**
   - MONGODB_URI
   - JWT_SECRET
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
   - CORS_ORIGINS
   - NODE_ENV=production

**Full Deployment Guide**: [See Backend/RENDER_DEPLOYMENT.md](Backend/RENDER_DEPLOYMENT.md)

### Mobile App Deployment (iOS/Android)

```bash
cd Mobile-App

# Build and deploy with EAS
eas build

# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

### Web App Deployment

**Vercel Deployment (Recommended):**
```bash
cd Web

# Connect to Vercel
vercel

# Deploy
vercel --prod
```

**Set Environment Variables in Vercel:**
- `NEXT_PUBLIC_API_URL=your-backend-api-url`

---

## 📚 Key Documentation

### Backend Documentation
- [Backend/README.md](Backend/README.md) - Backend overview
- [Backend/SETUP.md](Backend/SETUP.md) - Installation & configuration
- [Backend/RENDER_DEPLOYMENT.md](Backend/RENDER_DEPLOYMENT.md) - Deployment guide
- [Backend/PROJECT_STRUCTURE.md](Backend/PROJECT_STRUCTURE.md) - Architecture details

### Mobile App Documentation
- [Mobile-App/README.md](Mobile-App/README.md) - Mobile app overview
- [Mobile-App/SCREEN_TITLES_GUIDE.md](Mobile-App/SCREEN_TITLES_GUIDE.md) - UI guidelines

### Web App Documentation
- [Web/README.md](Web/README.md) - Web app overview
- [Web/INTEGRATION_GUIDE.md](Web/INTEGRATION_GUIDE.md) - API integration guide

### General Documentation
- [PROJECT_COMPLETION_STATUS.md](PROJECT_COMPLETION_STATUS.md) - Current project status
- [SCREEN_TITLES_COMPREHENSIVE_AUDIT.md](SCREEN_TITLES_COMPREHENSIVE_AUDIT.md) - UI audit

---

## 🎯 Core Features Implementation

### Smart Settlement Algorithm
The backend implements an advanced debt settlement calculation that:
- Minimizes the number of transactions needed
- Uses direct debt netting to reduce complexity
- Calculates optimal payment flows between members
- Supports multiple currencies

**Location**: [Backend/src/utils/settlement.ts](Backend/src/utils/settlement.ts)

### Notification System
- Real-time notifications for:
  - New expense added
  - Settlement requests
  - Group invitations
  - Member joined/left
  - Budget alerts

**Location**: [Backend/src/utils/notification.ts](Backend/src/utils/notification.ts)

### Expense Split Types
1. **Equal Split**: Divide equally among all members
2. **Unequal Split**: Specify exact amounts for each member
3. **Percentage Split**: Divide by percentage (must total 100%)
4. **Shares Split**: Divide by number of shares

### Analytics & Reports
- Spending by category (pie/donut charts)
- Spending by member (bar charts)
- Trends over time (line charts)
- Budget vs actual spending
- Per-member analytics

---

## 🤝 Contributing

We welcome contributions! Here's how:

### Get Started
1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/your-username/smartsplit.git`
3. **Create** a feature branch: `git checkout -b feature/your-feature`
4. **Make** your changes
5. **Commit**: `git commit -m "Add your feature"`
6. **Push**: `git push origin feature/your-feature`
7. **Create** a Pull Request

### Code Style
- Use TypeScript for type safety
- Follow existing code patterns
- Add comments for complex logic
- Test your changes before submitting

### Areas for Contribution
- 🐛 Bug fixes
- ✨ New features
- 📖 Documentation
- 🎨 UI/UX improvements
- 🧪 Test coverage
- 🚀 Performance optimizations

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- [Expo](https://expo.dev) - React Native framework
- [Next.js](https://nextjs.org) - React framework
- [Express](https://expressjs.com) - Node.js framework
- [MongoDB](https://mongodb.com) - Database
- [Cloudinary](https://cloudinary.com) - File storage

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/your-username/smartsplit/issues)
- **Email**: support@smartsplit.app
- **Website**: https://smartsplit.app

---

## 🗺️ Roadmap

- [ ] Social features (friending, activity feed)
- [ ] Advanced analytics & reports
- [ ] Integration with payment gateways (Stripe, Razorpay)
- [ ] Offline mode with sync
- [ ] Desktop app (Electron)
- [ ] Internationalization (i18n)
- [ ] Dark mode improvements
- [ ] Real-time collaboration features
- [ ] AI-powered expense categorization
- [ ] Advanced budgeting recommendations

---

**Happy splitting! 🎉**

Last Updated: April 2026
