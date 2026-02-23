# SmartSplit - Expo Setup Complete ✅

## 📦 Installed Dependencies

### Core Navigation & UI
- ✅ @react-navigation/native - Navigation framework
- ✅ @react-navigation/bottom-tabs - Bottom tab navigation
- ✅ @react-navigation/stack - Stack navigation
- ✅ @expo/vector-icons - Icon library
- ✅ react-native-paper - Material Design components
- ✅ react-native-modal - Modal components

### API & Data Management
- ✅ axios - HTTP client for API calls
- ✅ @react-native-async-storage/async-storage - Local storage
- ✅ expo-secure-store - Secure token storage

### Media & Utilities
- ✅ expo-image-picker - Image selection
- ✅ react-native-svg - SVG support
- ✅ react-native-chart-kit - Charts and analytics

### Animation & Gestures
- ✅ react-native-reanimated - Smooth animations
- ✅ react-native-gesture-handler - Touch gestures

## 📁 Folder Structure

```
SmartSplit/
├── src/
│   ├── screens/           # All app screens
│   ├── components/        # Reusable UI components
│   │   ├── common/       # Generic components
│   │   ├── trip/         # Trip-specific components
│   │   └── expense/      # Expense-specific components
│   ├── navigation/        # Navigation configuration
│   ├── services/          # API service layer
│   │   └── api.ts        # ✅ Axios instance with JWT interceptor
│   ├── context/           # React Context providers
│   │   └── AuthContext.tsx # ✅ Authentication state management
│   ├── hooks/             # Custom React hooks
│   │   └── useApi.ts     # ✅ API call hook
│   ├── utils/             # Helper functions
│   │   └── helpers.ts    # ✅ Utility functions
│   ├── constants/         # App constants
│   │   ├── theme.ts      # ✅ Complete design system
│   │   └── categories.ts # ✅ Expense categories & icons
│   └── types/             # TypeScript definitions
│       └── index.ts      # ✅ All type definitions
├── assets/
│   ├── images/           # Image assets
│   └── fonts/            # Custom fonts
├── app/                  # Expo Router pages
├── components/           # Existing Expo components
├── constants/            # Expo constants
└── hooks/                # Expo hooks
```

## 🔧 Key Files Created

### 1. **API Service** (`src/services/api.ts`)
- ✅ Axios base configuration pointing to backend
- ✅ JWT token interceptor (auto-attaches token to every request)
- ✅ Comprehensive API endpoints for all features
- ✅ Token management helpers

**Features:**
- Auto-login with stored tokens
- Global error handling
- Request/response logging
- 401 handling (auto-logout)

### 2. **Theme System** (`src/constants/theme.ts`)
Complete design system with:
- ✅ Color palette (primary, secondary, semantic colors)
- ✅ Typography (font sizes, weights, line heights)
- ✅ Spacing scale (consistent padding/margins)
- ✅ Border radius presets
- ✅ Shadow definitions (iOS & Android)
- ✅ Common reusable styles
- ✅ Animation durations
- ✅ Z-index layers

**Usage:**
```typescript
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';

const styles = {
  container: {
    backgroundColor: COLORS.background,
    padding: SPACING.base,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  }
};
```

### 3. **Categories & Constants** (`src/constants/categories.ts`)
- ✅ 12 expense categories with icons & colors
- ✅ Trip status types and labels
- ✅ Split methods (equal, percentage, amount, shares)
- ✅ Currency codes and symbols
- ✅ Payment methods
- ✅ Date range presets
- ✅ Notification types
- ✅ Storage keys
- ✅ Error messages

**Expense Categories:**
- Food & Dining 🍽️
- Transportation 🚗
- Accommodation 🛏️
- Entertainment 🎫
- Shopping 🛍️
- Health 💊
- Utilities ⚡
- Drinks & Bar 🍷
- Activities 🚴
- Groceries 🛒
- Flight ✈️
- Other 📦

### 4. **Auth Context** (`src/context/AuthContext.tsx`)
Complete authentication state management:
- ✅ User state management
- ✅ Login/Register/Logout functions
- ✅ Google OAuth support
- ✅ Token persistence
- ✅ Auto-login on app start
- ✅ User profile updates

**Usage:**
```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

### 5. **Helper Functions** (`src/utils/helpers.ts`)
20+ utility functions:
- ✅ Format currency with symbols
- ✅ Date/time formatting
- ✅ Email/password validation
- ✅ Text manipulation
- ✅ Color generation
- ✅ Array operations
- ✅ Debouncing
- ✅ Split calculations

### 6. **TypeScript Types** (`src/types/index.ts`)
Complete type definitions for:
- ✅ User, Trip, Expense, Settlement
- ✅ API responses
- ✅ Navigation types
- ✅ Component props
- ✅ Form data
- ✅ State types

### 7. **Custom Hooks** (`src/hooks/useApi.ts`)
- ✅ Loading state management
- ✅ Error handling
- ✅ Success callbacks
- ✅ Data caching

## 🔌 Backend Connection

### Environment Configuration
Update your backend URL in `src/services/api.ts`:

```typescript
const BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api'  // Local development
  : 'https://smartsplit-app-cv3e.onrender.com/api'; // Production
```

### API Endpoints Available

**Auth:**
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/google-login`
- POST `/auth/logout`

**User:**
- GET `/user/profile`
- PUT `/user/profile`
- POST `/user/profile/image`

**Trips:**
- GET `/trips`
- GET `/trips/:id`
- POST `/trips`
- PUT `/trips/:id`
- DELETE `/trips/:id`
- POST `/trips/:id/members`

**Expenses:**
- GET `/expenses/trip/:tripId`
- POST `/expenses`
- PUT `/expenses/:id`
- DELETE `/expenses/:id`
- POST `/expenses/:id/receipt`

**Settlements:**
- POST `/trips/:id/settlements/calculate`
- PUT `/settlements/:id/paid`

**Analytics:**
- GET `/analytics/trip/:id`
- GET `/analytics/user`

**Notifications:**
- GET `/notifications`
- PUT `/notifications/:id/read`

## 🚀 Next Steps

### 1. Install Dependencies
```bash
cd SmartSplit
npm install
```

### 2. Start Development Server
```bash
npm start
# or
npx expo start
```

### 3. Create Your First Screen

Example Login Screen:
```typescript
import { useAuth } from '@/src/context/AuthContext';
import { COLORS, SPACING, FONTS } from '@/src/constants/theme';
import { isValidEmail } from '@/src/utils/helpers';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async () => {
    try {
      await login(email, password);
      // Navigation handled by AuthContext
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  
  return (
    <View style={styles.container}>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      <Button onPress={handleLogin} disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </View>
  );
}
```

### 4. Make API Calls

```typescript
import { apiService } from '@/src/services/api';
import { useApi } from '@/src/hooks/useApi';

// Using the hook
const { data, loading, error, execute } = useApi(apiService.trips.getAll);

// Fetch trips
useEffect(() => {
  execute();
}, []);

// Or directly
const trips = await apiService.trips.getAll();
```

### 5. Use Theme System

```typescript
import { COLORS, SPACING, RADIUS, SHADOWS } from '@/src/constants/theme';

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    padding: SPACING.base,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
  },
  title: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.text,
  },
});
```

## 📱 App Architecture

```
User opens app
  ↓
AuthContext checks for stored token
  ↓
If token exists → Auto-login → Dashboard
  ↓
If no token → Login Screen
  ↓
User logs in → JWT token stored → Navigate to Dashboard
  ↓
API calls automatically include token via interceptor
  ↓
Protected routes accessible
```

## 🔐 Authentication Flow

1. **Login/Register** → Backend returns JWT token
2. **Token Storage** → Saved to AsyncStorage via `setAuthToken()`
3. **Auto-attach** → Axios interceptor adds token to all requests
4. **Session Persistence** → Token checked on app start
5. **Auto-logout** → 401 responses clear token and redirect to login

## 🎨 Design System Usage

All screens should reference the theme constants:
- Never hardcode colors → Use `COLORS.*`
- Never hardcode spacing → Use `SPACING.*`
- Never hardcode font sizes → Use `FONTS.*`
- Use predefined shadows → `SHADOWS.*`
- Use predefined radius → `RADIUS.*`

This ensures:
✅ Consistent UI across the app
✅ Easy theme switching (light/dark mode)
✅ Quick design updates from one file

## 🛠️ Development Tips

1. **Organize by Feature** - Keep related components together
2. **Use TypeScript** - All types are defined in `src/types/index.ts`
3. **Error Handling** - Use try-catch with user-friendly messages
4. **Loading States** - Always show loading indicators
5. **Offline Support** - Cache data when possible
6. **Validation** - Use helper functions from `utils/helpers.ts`

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Axios Documentation](https://axios-http.com/)

---

**Setup Complete! 🎉** Your SmartSplit app is now ready for development with a professional architecture, complete API integration, and a comprehensive design system.
