# Trip Splitter Backend - Project Structure

```
/trip-spit/
│
├── backend/                          # ✨ NEW NODE.JS/EXPRESS BACKEND
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts          # MongoDB connection & lifecycle
│   │   │   └── cloudinary.ts        # File upload configuration
│   │   │
│   │   ├── controllers/             # Business logic layer
│   │   │   ├── auth.controller.ts       # Register, login, logout
│   │   │   ├── user.controller.ts       # Profile, search, uploads
│   │   │   ├── trip.controller.ts       # Trip CRUD, members
│   │   │   ├── expense.controller.ts    # Expense management
│   │   │   ├── settlement.controller.ts # Complex debt calculation
│   │   │   ├── itinerary.controller.ts  # Activities
│   │   │   ├── packing.controller.ts    # Packing lists
│   │   │   ├── chat.controller.ts       # Messages
│   │   │   ├── analytics.controller.ts  # Spending data
│   │   │   └── notification.controller.ts # Notifications
│   │   │
│   │   ├── models/                  # MongoDB schemas
│   │   │   ├── User.model.ts
│   │   │   ├── Trip.model.ts
│   │   │   ├── Expense.model.ts
│   │   │   ├── Notification.model.ts
│   │   │   ├── Activity.model.ts
│   │   │   ├── PackingItem.model.ts
│   │   │   └── Message.model.ts
│   │   │
│   │   ├── routes/                  # API endpoint handlers
│   │   │   ├── auth.routes.ts       # 3 endpoints
│   │   │   ├── user.routes.ts       # 6 endpoints
│   │   │   ├── trip.routes.ts       # 18 endpoints (trips + features)
│   │   │   ├── expense.routes.ts    # 3 endpoints
│   │   │   └── notification.routes.ts # 2 endpoints
│   │   │
│   │   ├── middleware/              # Request processors
│   │   │   ├── auth.middleware.ts       # JWT verification
│   │   │   ├── errorHandler.ts         # Error handling
│   │   │   └── upload.middleware.ts    # File upload handler
│   │   │
│   │   ├── utils/
│   │   │   └── notification.ts       # Notification helpers
│   │   │
│   │   └── server.ts                # Express app setup & startup
│   │
│   ├── .env.example                 # Environment variables template
│   ├── .gitignore                   # Git ignore rules
│   ├── tsconfig.json                # TypeScript configuration
│   ├── nodemon.json                 # Dev watch config
│   ├── package.json                 # Dependencies
│   │
│   ├── README.md                    # Project documentation
│   ├── SETUP.md                     # Installation guide
│   ├── API_ROUTES.md                # API documentation
│   ├── MIGRATION_SUMMARY.md         # Migration details
│   └── dist/                        # Compiled JavaScript (generated)
│
├── SmartSplit/                      # React Native mobile app
│   └── (connects to backend API)
│
├── Trip-Splitter-/                  # Web app (Vite + React)
│   └── (connects to backend API)
│
└── trip-splitter-next/              # Old Next.js backend (can deprecate)
    └── (being replaced by backend/)
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  CLIENT APPLICATIONS                         │
├─────────────────────┬───────────────────┬───────────────────┤
│   Web Browser       │  Mobile App       │  Third Party      │
│  (Trip-Splitter-)   │  (SmartSplit)     │  Apps             │
└─────────┬───────────┴────────┬──────────┴────────┬──────────┘
          │                     │                  │
          └─────────────────────┼──────────────────┘
                                │ HTTP/CORS
                                ▼
        ┌─────────────────────────────────────────┐
        │      Express.js API Gateway             │
        │     (backend/src/server.ts)             │
        └─────────────────────────────────────────┘
                                │
        ┌───────────┬───────────┼───────────┬────────────┐
        │           │           │           │            │
        ▼           ▼           ▼           ▼            ▼
    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌───────────┐
    │  Auth  │ │ Trips  │ │Expenses│ │ Files  │ │Notifications
    │Routes  │ │Routes  │ │Routes  │ │Upload  │ │Routes
    └────┬───┘ └───┬────┘ └───┬────┘ └───┬────┘ └────┬──────┘
         │         │          │          │           │
         │         ▼          ▼          ▼           │
         │    ┌──────────────────────────────────┐   │
         │    │      Controllers                 │   │
         │    │  (Business Logic Layer)          │   │
         │    └──────────────────────────────────┘   │
         │                  │                         │
         └──────────────────┼─────────────────────────┘
                            ▼
         ┌──────────────────────────────────────────┐
         │      Models (MongoDB Schemas)            │
         │  User, Trip, Expense, Activity, etc.    │
         └──────────────────────────────────────────┘
                            │
                            ▼
         ┌──────────────────────────────────────────┐
         │        MongoDB Database                  │
         │  (Cloud or Local Instance)              │
         └──────────────────────────────────────────┘
                            │
         ┌──────────────────┴──────────────────────┐
         ▼                                         ▼
    ┌─────────────┐                        ┌──────────────┐
    │  Cloudinary │                        │  JWT Service │
    │ File Storage│                        │ Auth Server  │
    └─────────────┘                        └──────────────┘
```

## Data Flow Example: Creating a Trip

```
1. User (Mobile/Web)
   └─ POST /api/trips/create { name, destination, members }
       │
2. Express Server (server.ts)
   └─ Authenticates JWT token
       │
3. Trip Route Handler (trip.routes.ts)
   └─ Routes to createTrip controller
       │
4. Trip Controller (trip.controller.ts)
   ├─ Validates input
   ├─ Looks up member emails in User.model
   ├─ Creates Trip document
   └─ Sends notifications
       │
5. Models (Trip.model.ts, User.model.ts, Notification.model.ts)
   └─ Save data to MongoDB
       │
6. MongoDB
   └─ Stores documents
       │
7. Response sent back
   └─ { success: true, tripId: "..." }
```

## API Endpoint Structure

```
/api/
├── /auth
│   ├── POST   /register
│   ├── POST   /login
│   └── POST   /logout
│
├── /user
│   ├── GET    /me
│   ├── PUT    /update
│   ├── GET    /search?query=
│   ├── POST   /upload-profile
│   ├── POST   /upload-qr
│   └── DELETE /delete-account
│
├── /trips
│   ├── POST   /create
│   ├── GET    /user
│   ├── GET    /:id
│   ├── POST   /:id/add-member
│   ├── POST   /:id/respond
│   ├── POST   /:id/end
│   ├── GET    /:id/settlements
│   ├── GET    /:id/analytics
│   ├── GET    /:id/itinerary
│   ├── POST   /:id/itinerary
│   ├── GET    /:id/packing
│   ├── POST   /:id/packing
│   ├── PUT    /:id/packing
│   ├── DELETE /:id/packing
│   ├── GET    /:id/chat
│   └── POST   /:id/chat
│
├── /expenses
│   ├── POST   /add
│   ├── PUT    /:id
│   └── DELETE /:id
│
└── /notifications
    ├── GET    /
    └── PUT    /
```

**Total: 32 API endpoints**

## Database Collections

```
MongoDB: trip-splitter
├── users
│   └── [name, email, password, profileImage, qrCode, ...]
├── trips
│   └── [name, destination, members[], expenses[], ...]
├── expenses
│   └── [title, amount, paidBy, splitBetween, splitType, ...]
├── notifications
│   └── [recipient, sender, message, type, isRead, ...]
├── activities
│   └── [trip, title, date, time, location, createdBy, ...]
├── packingitems
│   └── [trip, text, category, isChecked, addedBy, ...]
├── messages
│   └── [trip, sender, content, createdAt, ...]
```

## Technology Stack Details

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Runtime | Node.js | ^20 | JavaScript runtime |
| Framework | Express.js | ^4.18 | Web framework |
| Language | TypeScript | ^5.3 | Type-safe development |
| Database | MongoDB | ^9.0 | Document database |
| ODM | Mongoose | ^9.0 | MongoDB object modeling |
| Auth | JWT | ^9.0 | Token-based auth |
| Security | Bcryptjs | ^3.0 | Password hashing |
| Files | Cloudinary | ^2.8 | Cloud storage |
| Upload | Multer | ^1.4 | File upload middleware |
| Headers | Helmet | ^7.1 | Security headers |
| Logging | Morgan | ^1.10 | HTTP logging |
| Compression | Compression | ^1.7 | Response compression |
| Dev | Nodemon | ^3.0 | Auto-reload |

## Deployment Options

```
Option 1: Traditional Hosting
├── Heroku
├── AWS EC2
├── DigitalOcean
├── Render
└── Railway

Option 2: Containerized
├── Docker + Docker Compose
└── Kubernetes

Option 3: Serverless
├── AWS Lambda
├── Google Cloud Functions
└── Azure Functions

For this setup, recommended: Docker + DigitalOcean OR Railway
```

## Development Workflow

```
1. Clone Repository
   └─ git clone <repo>

2. Install Dependencies
   └─ npm install

3. Configure Environment
   └─ cp .env.example .env
   └─ Edit .env with your settings

4. Start Development Server
   └─ npm run dev
   └─ Server runs on http://localhost:5000

5. Make Changes
   └─ Edit source files in src/
   └─ Nodemon auto-reloads

6. Test
   └─ Use Postman, Insomnia, or cURL
   └─ Test endpoints from API_ROUTES.md

7. Build Production
   └─ npm run build
   └─ Creates dist/ folder

8. Deploy
   └─ npm start
   └─ Runs compiled production code
```

## Environment Configuration Summary

```
Development
├── PORT=5000
├── NODE_ENV=development
├── MONGODB_URI=mongodb://localhost:27017/trip-splitter
├── JWT_SECRET=dev-secret-key
├── CLOUDINARY_CLOUD_NAME=dev-account
└── CORS_ORIGINS=http://localhost:*

Production
├── PORT=80/443
├── NODE_ENV=production
├── MONGODB_URI=mongodb+srv://prod-cluster
├── JWT_SECRET=strong-production-secret
├── CLOUDINARY_CLOUD_NAME=prod-account
└── CORS_ORIGINS=https://app.example.com,https://mobile.example.com
```

## Quick Links

- **Documentation**: [README.md](./README.md)
- **Setup Instructions**: [SETUP.md](./SETUP.md)
- **API Reference**: [API_ROUTES.md](./API_ROUTES.md)
- **Migration Details**: [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)

---

**Backend Created**: ✅ Complete
**Status**: Ready for Development
**Database**: MongoDB compatible
**Deployment**: Production-ready
