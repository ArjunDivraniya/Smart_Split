# 📱 Mobile App Testing Guide - Groups Feature

## ✅ Backend Status: OPERATIONAL

- Backend running on `http://localhost:5000`
- All APIs responding correctly
- Database connected and operational
- Authentication working
- Groups fetching returning complete data

## 🚀 How to Test on Mobile App

### Step 1: Start the Mobile Development Server

```bash
cd "c:\ARJUN DIVRANIYA\Coding Gita\Smart_Split\Mobile-App"
npx expo start
```

### Step 2: Run on Device/Emulator

Choose one of the following:
- **Web Simulator**: Press `w` in the terminal
- **iOS Simulator**: Press `i` (if on macOS)
- **Android Emulator**: Press `a`
- **Physical Device**: Scan the QR code with Expo Go app

### Step 3: Login

Use these credentials:
```
Email: arjundiv@test.com
Password: TestPassword123
```

Expected behavior:
- ✅ Login succeeds
- ✅ Navigates to home screen
- ✅ Token stored in AsyncStorage

### Step 4: Navigate to Groups Tab

Once logged in:
1. Look for the "Groups" tab at the bottom of the screen
2. Should display a list of groups

Expected result:
```
Groups Screen:
- Shows 8 groups
- Each group displays:
  - Emoji: 👥 or 🎉
  - Name: "Friend Group" or "Test Group 1"
  - Type: "food" or "college"
  - Member count
  - Last created: Today
```

## 🔍 Debugging - Check Console Logs

The mobile app logs authentication and group fetching. Watch for:

```
✅ Successful Login
📝 Fetching groups from API...
✅ Groups fetched successfully: 8 groups
```

Or if there's an error:
```
❌ Error fetching groups: ...
```

## 🧪 What's Being Tested

| Feature | Expected | Status |
|---------|----------|--------|
| Login | User authenticates and token stored | ✅ Ready |
| Token Storage | Token saved in AsyncStorage | ✅ Verified |
| Token Retrieval | Token added to all API requests | ✅ Verified |
| Groups Fetch | GET /api/groups with Bearer token | ✅ Working |
| Data Mapping | Groups display with emoji, name, type | ✅ Ready |
| Error Handling | Shows error if API fails | ✅ Implemented |
| Loading State | Shows spinner while fetching | ✅ Implemented |

## 📊 Backend Logs You'll See

When the mobile app fetches groups, the backend logs will show:

```
[2026-02-24T...] GET /api/groups
[AUTH] Checking auth for: GET /
[AUTH] Token present: YES
[AUTH] ✅ User authenticated: 699d6d10931f8cd8644b9695

📡 ============ GET /api/groups REQUEST ============
Authorization Header: Bearer eyJhbGc...
All Headers: { authorization: "Bearer ...", ... }
Extracted userId from req: 699d6d10931f8cd8644b9695

Searching Group collection...
✅ Found 8 groups

🎉 Returning 8 total groups/trips
GET /api/groups 200 283ms - 5257 bytes
```

## 🎯 Expected Group Details

When you see the groups on screen, here's what each field represents:

```json
{
  "emoji": "👥",                           // Group icon
  "name": "Friend Group",                  // Group name
  "type": "food",                          // Group category
  "description": "Group with friends",     // Group description
  "createdBy": {
    "name": "Test User",
    "email": "arjundiv@test.com"
  },
  "members": [
    {
      "userName": "Test User",
      "email": "arjundiv@test.com",
      "role": "creator"                    // User's role in group
    }
  ],
  "totalSpent": 0,                         // Total expenses in group
  "netBalance": 0,                         // User's balance
  "isActive": true,                        // Group is active
  "createdAt": "2026-02-24T..."          // When group was created
}
```

## ✨ Features to Explore

After confirming groups display:

1. **Create a New Group**
   - Tap "+" button to create a group
   - Add name, type, emoji, description
   - Verify it appears in the list immediately

2. **View Group Details**
   - Tap on a group card
   - Should show all group information
   - Display members list
   - Show expenses (if any)

3. **Add Expenses** (if implemented)
   - Within a group, add an expense
   - Specify amount and category
   - See group's totalSpent update

## 🛠️ Troubleshooting

### Groups not showing (shows 0 groups)
- Check backend is running: `netstat -ano | findstr :5000`
- Check login credentials are correct
- Check console logs for error messages
- Verify token is being sent: Look for `[AUTH] Token present: YES` in backend logs

### "Failed to load groups" error in app
- Check backend is responding: `curl http://localhost:5000/api/groups/health/check`
- Verify backend token generation: Check if Authorization header is in backend logs
- Check network connection on device

### App crashes on login
- Check mobile app console logs
- Verify AsyncStorage is working
- Check if token contains special characters

### Groups list empty after login
- Verify backend is returning groups: `node comprehensive-backend-test.js`
- Check if logged-in user owns any groups
- Verify API response has `data` array

## 📞 Backend API Reference

### Health Check (Public)
```
GET http://localhost:5000/api/groups/health/check
Response: { groupsCollectionCount: 3, status: "ok" }
```

### Login
```
POST http://localhost:5000/api/auth/login
Body: { email: "...", password: "..." }
Response: { token: "...", user: {...} }
```

### Fetch Groups (Authenticated)
```
GET http://localhost:5000/api/groups
Headers: { Authorization: "Bearer {token}" }
Response: { success: true, data: [...] }
```

### Create Group (Authenticated)
```
POST http://localhost:5000/api/groups
Headers: { Authorization: "Bearer {token}" }
Body: { 
  name: "...", 
  type: "trip|college|food|flatmates|event|custom", 
  emoji: "..." 
}
Response: { success: true, data: {...} }
```

## 🎉 Success Criteria

✅ Mobile app is working correctly when:
1. User can login with provided credentials
2. Groups tab displays all 8 groups
3. Each group shows emoji, name, type
4. No console errors appear
5. Backend logs show successful authentication and groups fetch

---

**Backend Status**: ✅ READY FOR TESTING
**Mobile App**: ✅ READY TO TEST
**Next Step**: Run the mobile app and verify groups display
