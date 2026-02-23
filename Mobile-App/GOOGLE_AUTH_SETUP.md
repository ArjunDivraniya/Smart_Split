# Google OAuth Setup Guide for SmartSplit Mobile App

## Overview
This guide will help you set up Google OAuth authentication for the SmartSplit mobile app. The app now supports signing in with Google in addition to email/password authentication.

## Prerequisites
- Google Cloud Console account
- Expo CLI installed
- Backend server running and accessible

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project name/ID

## Step 2: Enable Google+ API

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google+ API" or "Google People API"
3. Click **Enable**

## Step 3: Create OAuth 2.0 Credentials

### A. Web Client (Required for Expo Go)

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Name it "SmartSplit Web Client"
5. Add authorized redirect URIs:
   - `https://auth.expo.io/@your-username/SmartSplit`
   - Replace `your-username` with your Expo username
6. Click **Create**
7. Copy the **Client ID**

### B. Android Client (Required for Android builds)

1. Click **Create Credentials** > **OAuth client ID**
2. Select **Android**
3. Name it "SmartSplit Android"
4. Package name: `com.yourcompany.smartsplit` (or your actual package name)
5. Get SHA-1 certificate fingerprint:
   ```bash
   # For development
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   
   # For production
   keytool -list -v -keystore /path/to/your/release.keystore -alias your-key-alias
   ```
6. Enter the SHA-1 fingerprint
7. Click **Create**
8. Copy the **Client ID**

### C. iOS Client (Required for iOS builds)

1. Click **Create Credentials** > **OAuth client ID**
2. Select **iOS**
3. Name it "SmartSplit iOS"
4. Bundle ID: `com.yourcompany.smartsplit` (or your actual bundle ID)
5. Click **Create**
6. Copy the **Client ID**

## Step 4: Configure Environment Variables

1. Create a `.env` file in the `Mobile-App` directory (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Add your Google OAuth credentials:
   ```env
   EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=your-web-client-id.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your-android-client-id.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=your-ios-client-id.apps.googleusercontent.com
   ```

3. **Important**: Never commit the `.env` file to version control! It's already in `.gitignore`.

## Step 5: Update app.json (if needed)

The `scheme` is already configured in `app.json`:
```json
{
  "expo": {
    "scheme": "smartsplit"
  }
}
```

## Step 6: Configure Backend

The backend already has the Google login endpoint configured at `/api/auth/google-login`. 

Ensure your backend is running and accessible from your mobile device:
- Set `EXPO_PUBLIC_API_URL` in `.env` if needed
- Or let the app auto-detect your local IP

## Step 7: Test the Integration

### Development with Expo Go

1. Start the backend server:
   ```bash
   cd Backend
   npm run dev
   ```

2. Start the Expo dev server:
   ```bash
   cd Mobile-App
   npx expo start
   ```

3. Open the app in Expo Go
4. Navigate to the Login or Register screen
5. Tap "Continue with Google"
6. Complete the Google sign-in flow
7. You should be redirected back to the app and logged in

### Building for Production

When building standalone apps:

1. Update `app.json` with proper bundle identifiers:
   ```json
   {
     "expo": {
       "ios": {
         "bundleIdentifier": "com.yourcompany.smartsplit"
       },
       "android": {
         "package": "com.yourcompany.smartsplit"
       }
     }
   }
   ```

2. Build the app:
   ```bash
   # For Android
   eas build --platform android
   
   # For iOS
   eas build --platform ios
   ```

## Troubleshooting

### "Google sign-in was cancelled or failed"
- Check that all client IDs are correctly configured
- Verify redirect URIs in Google Cloud Console
- Make sure the Web client ID is correct (required for Expo Go)

### "Failed to fetch user info from Google"
- Check your internet connection
- Verify that Google+ API is enabled
- Check that the access token is valid

### "Failed to get authentication token from server"
- Verify backend is running and accessible
- Check `EXPO_PUBLIC_API_URL` configuration
- Verify the `/api/auth/google-login` endpoint is working
- Check backend logs for errors

### iOS-specific issues
- Make sure the bundle identifier matches in both app.json and Google Console
- Verify iOS client ID is configured correctly

### Android-specific issues
- Ensure the package name matches in app.json and Google Console
- Verify SHA-1 fingerprint is correct
- For production builds, use the production keystore's SHA-1

## Security Notes

1. **Never commit credentials**: Keep `.env` out of version control
2. **Use different credentials**: Use separate OAuth clients for dev/staging/prod
3. **Restrict client IDs**: In Google Cloud Console, restrict client IDs to specific domains/apps
4. **Monitor usage**: Regularly check OAuth consent screen and usage in Google Cloud Console

## Backend Integration

The backend endpoint `/api/auth/google-login` expects:
```typescript
{
  email: string;
  name: string;
  googleId: string;
  profileImage?: string;
}
```

It returns:
```typescript
{
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
}
```

The token is a JWT that's valid for 7 days.

## Additional Resources

- [Expo AuthSession Documentation](https://docs.expo.dev/guides/authentication/#google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

## Support

If you encounter issues not covered in this guide:
1. Check the console logs in both the app and backend
2. Verify all environment variables are set correctly
3. Ensure backend database is connected and running
4. Check that all required packages are installed
