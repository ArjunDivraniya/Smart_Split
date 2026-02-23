# Google Authentication Testing Guide

## Quick Testing Checklist

### 1. Backend Status
- [ ] Backend server is running (`npm run dev` in Backend folder)
- [ ] Database is connected
- [ ] `/api/auth/google-login` endpoint is accessible

### 2. Environment Configuration
- [ ] `.env` file created in Mobile-App folder
- [ ] Google OAuth credentials configured (or using test mode)
- [ ] Backend URL is correct (auto-detected or set in EXPO_PUBLIC_API_URL)

### 3. Mobile App
- [ ] Packages installed (`npm install` in Mobile-App folder)
- [ ] App starts without errors (`npx expo start`)
- [ ] Login screen displays Google Sign-In button
- [ ] Register screen displays Google Sign-In button

## Test Without Google OAuth Credentials

You can test the UI and flow without actual Google OAuth credentials:

1. Start the backend:
   ```bash
   cd Backend
   npm run dev
   ```

2. Start the mobile app:
   ```bash
   cd Mobile-App
   npx expo start
   ```

3. Open the app and navigate to Login screen
4. You should see:
   - Email and Password fields
   - "Sign In" button
   - "OR" divider
   - "Continue with Google" button (may be disabled without credentials)

## Test With Google OAuth Credentials

Once you have configured Google OAuth credentials in `.env`:

1. Make sure all three client IDs are set in `.env`:
   ```env
   EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=xxx.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=xxx.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=xxx.apps.googleusercontent.com
   ```

2. Restart the Expo server to load new environment variables

3. Open app and tap "Continue with Google"

4. Complete Google sign-in flow:
   - Select/enter your Google account
   - Grant permissions
   - Should redirect back to app
   - Should be logged in and navigated to main tabs

## Expected Behavior

### Successful Google Sign-In:
1. Tap "Continue with Google"
2. Browser/WebView opens with Google sign-in
3. Sign in with Google account
4. Browser closes automatically
5. App processes the authentication
6. App navigates to main screen (tabs)
7. User data is stored locally

### Backend Integration:
1. App sends Google user info to `/api/auth/google-login`:
   ```json
   {
     "email": "user@gmail.com",
     "name": "User Name",
     "googleId": "123456789",
     "profileImage": "https://..."
   }
   ```

2. Backend creates/finds user and returns JWT token:
   ```json
   {
     "success": true,
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "user": {
       "id": "...",
       "name": "User Name",
       "email": "user@gmail.com",
       "profileImage": "https://..."
     }
   }
   ```

3. App stores token and navigates to main screen

## Common Issues & Solutions

### Issue: Button is disabled
**Solution**: Environment variables not loaded. Restart Expo dev server.

### Issue: "Google sign-in was cancelled"
**Solution**: Normal if you press back/cancel. Try again.

### Issue: "Failed to fetch user info from Google"
**Possible causes**:
- Invalid or expired access token
- Google API not enabled
- Network connectivity issues

### Issue: "Failed to get authentication token from server"
**Possible causes**:
- Backend not running
- Backend URL incorrect
- Database connection issue
- Check backend console logs

### Issue: App doesn't navigate after sign-in
**Possible causes**:
- Token not stored correctly
- Navigation issue
- Check mobile app console logs

## Debugging Tips

### View Console Logs

1. **Mobile App**: Run with debug mode
   ```bash
   npx expo start
   # Press 'j' to open debugger
   ```

2. **Backend**: Logs appear in terminal where `npm run dev` is running

### Test Backend Endpoint Directly

Use curl or Postman to test the endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/google-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "name": "Test User",
    "googleId": "123456789",
    "profileImage": "https://example.com/photo.jpg"
  }'
```

Expected response:
```json
{
  "message": "Google login successful",
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@gmail.com",
    "profileImage": "https://example.com/photo.jpg"
  }
}
```

## Complete Flow Diagram

```
User Taps "Continue with Google"
  ↓
App calls promptAsync() from expo-auth-session
  ↓
Browser/WebView opens Google sign-in page
  ↓
User signs in with Google account
  ↓
Google redirects back to app with access token
  ↓
App fetches user info from Google API
  ↓
App sends user info to backend /api/auth/google-login
  ↓
Backend creates/finds user in database
  ↓
Backend generates JWT token
  ↓
Backend returns token and user data
  ↓
App stores token in AsyncStorage
  ↓
App navigates to main screen (tabs)
```

## What's Been Implemented

✅ Google Auth helper functions (`src/utils/googleAuth.ts`)
✅ Google Sign-In button on Login screen
✅ Google Sign-In button on Register screen
✅ Backend integration with `/api/auth/google-login`
✅ Token storage and session management
✅ Error handling and user feedback
✅ UI styling consistent with app theme

## Next Steps (Optional)

- [ ] Add profile picture display after Google sign-in
- [ ] Add "Sign in with Apple" for iOS
- [ ] Add biometric authentication
- [ ] Add social profile linking (link Google to existing account)
- [ ] Add account deletion with OAuth cleanup
