# 🔗 Frontend-Backend Integration Guide

## Overview

Your Trip Splitter application now has a **complete separation** between the Express backend and Next.js frontend. This guide explains how they work together and how to test the integration.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User's Browser                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │         Next.js Frontend (Port 3000)                │   │
│  │  - NextAuth Session Management                      │   │
│  │  - UI Components                                    │   │
│  │  - useBackendAPI Hook                               │   │
│  └────────────────┬───────────────────────────────────┘   │
│                   │ HTTP Requests with JWT Token           │
└───────────────────┼────────────────────────────────────────┘
                    │
                    │ Authorization: Bearer <token>
                    │ Cookie: token=<jwt>
                    ▼
┌─────────────────────────────────────────────────────────────┐
│          Express Backend (Port 5000)                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │              Auth Middleware                        │   │
│  │  - Verifies JWT Token                               │   │
│  │  - Extracts userId                                  │   │
│  └────────────────┬───────────────────────────────────┘   │
│                   │                                         │
│  ┌────────────────▼───────────────────────────────────┐   │
│  │         Controllers & Routes                        │   │
│  │  - 32 API Endpoints                                 │   │
│  │  - Business Logic                                   │   │
│  └────────────────┬───────────────────────────────────┘   │
│                   │                                         │
│  ┌────────────────▼───────────────────────────────────┐   │
│  │           MongoDB Database                          │   │
│  │  - 7 Collections (Users, Trips, etc.)               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

### 1. User Login (Credentials)

```
User enters email/password
        ↓
Next.js Login Page (/login)
        ↓
NextAuth CredentialsProvider
        ↓
POST /api/auth/login → Express Backend
        ↓
Express validates credentials
        ↓
Express generates JWT (7 days expiry)
        ↓
Returns: { token, user: { id, name, email, profileImage } }
        ↓
NextAuth stores token in session JWT
        ↓
Session object contains: backendToken, user info
        ↓
Frontend can now make authenticated API calls
```

### 2. Token Usage in API Calls

```typescript
// In any React component
import { useSession } from 'next-auth/react';
import { trips } from '@/lib/api-client';

function MyComponent() {
  const { data: session } = useSession();
  
  useEffect(() => {
    const fetchTrips = async () => {
      const token = (session as any)?.backendToken;
      if (!token) return;
      
      const response = await trips.getUserTrips(token);
      // Handle response
    };
    
    fetchTrips();
  }, [session]);
}
```

### 3. Or Use the Custom Hook (Recommended)

```typescript
import { useBackendAPI } from '@/hooks/useBackendAPI';

function MyComponent() {
  const { call, loading, error } = useBackendAPI();
  
  useEffect(() => {
    const fetchTrips = async () => {
      const response = await call('/trips/user');
      // Token is automatically attached!
    };
    
    fetchTrips();
  }, []);
}
```

---

## 📁 Configuration Files

### Frontend: `.env.local` (Next.js)

```env
# Backend URL (change based on environment)
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-nextauth-key

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Location:** `trip-splitter-next/.env.local`

### Backend: `.env` (Express)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/trip-splitter

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:8081
```

**Location:** `backend/.env`

---

## ✅ Your Configuration Status

### ✅ Backend (.env)
- ✅ MongoDB URI configured with database name
- ✅ JWT_SECRET set (7 days expiry)
- ✅ Cloudinary credentials configured
- ✅ CORS origins include frontend URLs
- ✅ NODE_ENV set to development
- ✅ PORT set to 5000

### ✅ Frontend (.env.local)
- ✅ NEXT_PUBLIC_BACKEND_URL set to http://localhost:5000
- ✅ NEXTAUTH_URL configured
- ✅ NEXTAUTH_SECRET configured
- ✅ Google OAuth credentials present

### ✅ NextAuth Configuration (route.ts)
- ✅ JWT callback stores backendToken
- ✅ Session callback exposes backendToken to frontend
- ✅ Token expiry set to 7 days (matches backend)
- ✅ Credentials provider calls Express /api/auth/login
- ✅ Google OAuth syncs with Express backend

### ✅ API Client (api-client.ts)
- ✅ All functions accept token parameter
- ✅ Token added to Authorization header
- ✅ credentials: 'include' for cookies
- ✅ 32 endpoints mapped to Express routes

### ✅ Express Backend (auth.controller.ts)
- ✅ JWT expiry: 7 days
- ✅ Returns token in response
- ✅ Sets HttpOnly cookie
- ✅ Bcrypt password hashing

---

## 🚀 Testing the Integration

### Step 1: Start the Backend

```bash
cd backend
npm run dev
```

**Expected Output:**
```
[nodemon] starting `ts-node src/server.ts`
MongoDB connected successfully
Server running on port 5000
```

**Test Health Check:**
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Trip Splitter Backend is running",
  "timestamp": "2026-02-22T..."
}
```

### Step 2: Start the Frontend

```bash
cd trip-splitter-next
npm run dev
```

**Expected Output:**
```
Ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Step 3: Test Complete Authentication Flow

#### A. Register a New User

1. Open http://localhost:3000/register
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!
3. Click "Register"
4. **Expected:** Redirected to login page

#### B. Login

1. Open http://localhost:3000/login
2. Enter credentials from above
3. Click "Login"
4. **Expected:** Redirected to dashboard

#### C. Verify Session

Open browser DevTools → Application → Storage → Cookies:
- Should see `next-auth.session-token`

In browser console:
```javascript
// Check session
await fetch('/api/auth/session').then(r => r.json())

// Should return:
{
  user: { name: "Test User", email: "test@example.com", ... },
  backendToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  backendTokenExpires: 1708876543,
  expires: "2026-03-01T..."
}
```

#### D. Test API Call

In dashboard, check Network tab:
- Dashboard should call `GET http://localhost:5000/api/trips/user`
- Headers should include:
  ```
  Authorization: Bearer eyJhbGciOiJI...
  ```
- Response Status: 200 OK

### Step 4: Test Core Features

#### Create a Trip
1. Go to http://localhost:3000/create-trip
2. Fill in trip details
3. Add members
4. Click "Create Trip"
5. **Expected:** Redirected to trip page

**API Call:** `POST /api/trips/create`

#### Add an Expense
1. Open a trip
2. Click "Add Expense"
3. Fill in details
4. **Expected:** Expense appears in list

**API Call:** `POST /api/expenses/add`

#### View Settlements
1. Open a trip with expenses
2. Navigate to Settlements tab
3. **Expected:** See who owes whom

**API Call:** `GET /api/trips/:id/settlements`

#### Test Chat
1. Open a trip
2. Go to Chat tab
3. Send a message
4. **Expected:** Message appears in chat

**API Calls:** 
- `GET /api/trips/:id/chat`
- `POST /api/trips/:id/chat`

---

## 🔍 Debugging Common Issues

### Issue 1: "Session loading..." forever

**Cause:** Frontend can't reach backend

**Fix:**
1. Check backend is running on port 5000
2. Check NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
3. Restart frontend (npm run dev)

### Issue 2: "backendToken missing from session"

**Cause:** Login didn't return token

**Fix:**
1. Check Express backend logs for errors
2. Verify JWT_SECRET is set in backend .env
3. Check /api/auth/login returns `{ token, user }`

### Issue 3: "401 Unauthorized" on API calls

**Cause:** Token invalid or expired

**Fix:**
1. Log out and log in again
2. Check JWT_SECRET matches between login and verify
3. Verify auth middleware is working

### Issue 4: "CORS error"

**Cause:** CORS origins not configured

**Fix:**
```env
# In backend/.env
CORS_ORIGINS=http://localhost:3000,http://localhost:8081
```

Restart backend.

### Issue 5: "MongoDB connection failed"

**Cause:** Invalid MongoDB URI

**Fix:**
1. Check MONGODB_URI in backend/.env
2. Ensure database name is included
3. Check IP whitelist in MongoDB Atlas

---

## 📊 Verification Checklist

Use this checklist to verify everything is working:

### Backend (http://localhost:5000)
- [ ] Health check responds: `GET /health`
- [ ] Can register: `POST /api/auth/register`
- [ ] Can login: `POST /api/auth/login`
- [ ] Login returns JWT token
- [ ] Protected routes require Authorization header
- [ ] MongoDB connection successful

### Frontend (http://localhost:3000)
- [ ] Login page loads
- [ ] Can create account
- [ ] Can login with credentials
- [ ] Session persists after refresh
- [ ] backendToken exists in session
- [ ] Dashboard loads trips

### Integration
- [ ] Frontend → Backend communication works
- [ ] JWT token attached to all API calls
- [ ] Authorization header present: `Bearer <token>`
- [ ] Cookies set properly (token, session-token)
- [ ] CORS allows localhost:3000
- [ ] All API endpoints return expected data

### Features
- [ ] Create trip works
- [ ] Add expense works
- [ ] View settlements works
- [ ] Itinerary features work
- [ ] Packing list works
- [ ] Chat works
- [ ] Notifications work
- [ ] Profile update works

---

## 🎯 What Makes This Setup Correct

### 1. Token Synchronization ✅
- Backend generates JWT on login (7 days)
- NextAuth stores it in session JWT
- Session callback exposes it to frontend
- Frontend accesses via `(session as any)?.backendToken`

### 2. API Client Consistency ✅
- All API functions accept `token` parameter
- Token added to Authorization header
- Proper error handling for 401 responses
- credentials: 'include' for cookie support

### 3. Core Route Connections ✅
- Auth: POST /api/auth/login, /register ← Working
- User: GET /api/user/me ← Token verified here first
- Trips: GET /api/trips/user ← Dashboard uses this
- Settlements: GET /api/trips/:id/settlements ← Algorithm works
- Expenses: POST /api/expenses/add ← Create expense

### 4. Security ✅
- Passwords hashed with bcrypt (10 rounds)
- JWT signed with secret
- HttpOnly cookies set
- CORS configured
- Token expires in 7 days
- Middleware verifies token on protected routes

---

## 📝 Summary of Changes Made

### 1. Frontend Configuration
- ✅ Updated `NEXT_PUBLIC_BACKEND_URL` to http://localhost:5000
- ✅ Verified NextAuth callbacks store/expose backendToken
- ✅ Confirmed API client adds Authorization headers

### 2. Backend Configuration
- ✅ Fixed MongoDB URI (added database name)
- ✅ Changed NODE_ENV to development
- ✅ Verified JWT expiry is 7 days
- ✅ Confirmed CORS includes localhost:3000

### 3. Integration Points
- ✅ Auth flow: NextAuth → Express → MongoDB
- ✅ Token flow: Login → JWT → Session → API Calls
- ✅ All 32 endpoints properly mapped
- ✅ Error handling for expired tokens

---

## 🎉 You're Ready!

Your frontend and backend are now **fully integrated** and configured correctly!

**Next Steps:**
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd trip-splitter-next && npm run dev`
3. Test login at http://localhost:3000/login
4. Create a trip and add expenses
5. Verify all features work

**For Production:**
- Change `NEXT_PUBLIC_BACKEND_URL` to your deployed backend URL
- Update `CORS_ORIGINS` in backend .env
- Set `NODE_ENV=production` in backend
- Use environment variables in deployment platform

---

**Need Help?** Check the debugging section above or review:
- [Backend README](../../backend/README.md)
- [API Routes Documentation](../../backend/API_ROUTES.md)
- [Backend Setup Guide](../../backend/SETUP.md)

🚀 **Happy Coding!**
