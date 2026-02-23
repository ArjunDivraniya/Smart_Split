# Profile Settings & Security Features - Implementation Guide

## Overview
This document outlines all the fixed features in the profile settings section, including backend routes, database models, and frontend implementation.

## ✅ Fixed Features

### 1. **Payment Preferences**
- **Endpoint**: `PUT /api/profile/payment-preferences`
- **Fields**:
  - `upiId`: UPI ID for receiving payments
  - `bankAccount`: Bank account details
  - `autoPay`: Enable automatic settlement transfers
- **Storage**: Saved in `User.paymentPreferences` in database
- **Frontend**: `/profile/payment.tsx`

### 2. **Currency Selection**
- **Endpoint**: `PUT /api/profile/preferences` (currency field)
- **Supported Currencies**: INR, USD, EUR, GBP, JPY, CAD, AUD, SGD, HKD, AED
- **Storage**: 
  - Database: `User.preferences.currency`
  - Local: `AsyncStorage` (preferred_currency)
- **Utility**: `src/utils/currency.ts` - Functions to format amounts with correct symbol
- **Frontend**: `/profile/currency.tsx`
- **Usage Example**:
  ```typescript
  import { getCurrencySymbol, getPreferredCurrency, formatCurrency } from '@/src/utils/currency';
  
  // Get symbol
  const symbol = getCurrencySymbol('USD'); // Returns: $
  
  // Format amount
  const formatted = await formatCurrency(1000, 'USD'); // Returns: $1,000
  ```

### 3. **Theme Selection**
- **Endpoint**: `PUT /api/profile/preferences` (theme field)
- **Options**: Dark, Light, System Default
- **Storage**:
  - Database: `User.preferences.theme`
  - Local: `AsyncStorage` (app_theme)
- **Frontend**: `/profile/theme.tsx`

### 4. **Expense Categories**
- **Endpoint**: `PUT /api/profile/categories`
- **Features**:
  - Toggle default categories on/off
  - **Add custom categories** with custom names and colors
  - **Delete custom categories** (default categories cannot be deleted)
  - Shows count of enabled and custom categories
- **Storage**: `User.expenseCategories` array
- **Default Categories**: 10 pre-defined categories
- **Frontend**: `/profile/categories.tsx`
- **Custom Categories**: 
  - Marked with `isCustom: true`
  - Have delete button
  - Can be any name with custom color selection

### 5. **Privacy Mode**
- **Endpoint**: `PUT /api/profile/privacy`
- **Settings**:
  - `privacyMode`: Master toggle to hide financial data
  - `hideBalances`: Hide balance amounts
  - `hideExpenses`: Hide individual expense amounts
  - `hideTransactions`: Hide transaction history
  - `dataCollection`: Allow usage data collection (recommended)
  - `analytics`: Share app performance data
  - `marketingEmails`: Receive feature updates
- **Storage**: `User.privacySettings` object
- **Frontend**: `/profile/privacy.tsx`

### 6. **App Lock & Fingerprint** ⭐ NEW
- **Endpoint**: `PUT /api/profile/security`
- **Features**:
  - **PIN-based app lock**: 4-digit PIN protection
  - **Fingerprint unlock**: Use device fingerprint to unlock
  - **Face Recognition**: Use face to unlock (on compatible devices)
  - Biometric features require app lock to be enabled first
  - PIN is hashed on server using bcryptjs
- **Storage**: `User.securitySettings` object
- **Dependencies**: `expo-local-authentication` (installed)
- **Utilities**: `src/utils/appLock.ts` - Biometric authentication helpers
- **Frontend**: `/profile/security-lock.tsx`
- **Usage Example**:
  ```typescript
  import { checkBiometricAvailability, authenticate } from '@/src/utils/appLock';
  
  // Check if biometric is available
  const bio = await checkBiometricAvailability();
  if (bio.available) {
    // Authenticate with biometric
    const success = await authenticate();
  }
  ```

## 📦 Backend Updates

### Database Schema Updates
**File**: `Backend/src/models/User.model.ts`

New fields added to User schema:
```typescript
paymentPreferences: {
  upiId: String,
  bankAccount: String,
  autoPay: Boolean
}

expenseCategories: [{
  id: String,
  name: String,
  icon: String,
  color: String,
  enabled: Boolean,
  isCustom: Boolean
}]

privacySettings: {
  privacyMode: Boolean,
  hideBalances: Boolean,
  hideExpenses: Boolean,
  hideTransactions: Boolean,
  dataCollection: Boolean,
  analytics: Boolean,
  marketingEmails: Boolean
}

securitySettings: {
  appLockEnabled: Boolean,
  fingerprintEnabled: Boolean,
  faceRecognitionEnabled: Boolean,
  pinCode: String (hashed)
}
```

### New API Endpoints
**File**: `Backend/src/routes/profile.routes.ts`

```
PUT /api/profile/payment-preferences      - Update payment methods
PUT /api/profile/categories               - Update expense categories
PUT /api/profile/privacy                  - Update privacy settings
PUT /api/profile/security                 - Update security/app lock
```

### New Controller Methods
**File**: `Backend/src/controllers/profile.controller.ts`

- `updatePaymentPreferences()` - Handles payment preference updates
- `updateCategories()` - Validates and saves categories
- `updatePrivacySettings()` - Saves privacy preferences
- `updateSecuritySettings()` - Hashes PIN and saves security settings

## 🔌 Mobile App Updates

### API Service
**File**: `Mobile-App/src/services/api.ts`

New profile endpoints added:
```typescript
profile: {
  updatePaymentPreferences: (data) => api.put('/profile/payment-preferences', data),
  updateCategories: (categories) => api.put('/profile/categories', { expenseCategories }),
  updatePrivacySettings: (settings) => api.put('/profile/privacy', { privacySettings }),
  updateSecuritySettings: (settings) => api.put('/profile/security', settings),
  // ... existing endpoints
}
```

### New Utility Files
1. **`src/utils/currency.ts`**
   - Currency formatting and symbol management
   - Functions: `getPreferredCurrency()`, `getCurrencySymbol()`, `formatCurrency()`, etc.

2. **`src/utils/appLock.ts`**
   - Biometric authentication helpers
   - PIN management functions
   - Functions: `checkBiometricAvailability()`, `authenticate()`, `verifyPIN()`, etc.

3. **`src/utils/initializePreferences.ts`**
   - Initialize default preferences for new users
   - Initialize default categories, privacy, and security settings

### Updated Components
1. **`src/components/BalanceSummaryCard.tsx`** - Now uses currency utility for dynamic currency symbol
2. **`app/profile.tsx`** - Shows all profile menu items including app lock
3. **`app/profile/payment.tsx`** - Save payment preferences
4. **`app/profile/currency.tsx`** - Select and apply currency
5. **`app/profile/theme.tsx`** - Select and apply theme
6. **`app/profile/categories.tsx`** - **Enhanced with custom category addition**
7. **`app/profile/privacy.tsx`** - Save privacy settings
8. **`app/profile/security-lock.tsx`** - Configure app lock and biometric

## 🚀 How to Use

### For Users

#### 1. **Set Payment Preferences**
- Go to Profile → Payment Preferences
- Enter UPI ID and/or Bank Account
- Toggle Auto Settlement if desired
- Save changes

#### 2. **Change Currency**
- Go to Profile → Currency
- Select your preferred currency
- Changes apply app-wide for amount displays

#### 3. **Manage Expense Categories**
- Go to Profile → Expense Categories
- Toggle default categories on/off
- **Tap the "+" button to add custom categories**
- Select color for custom categories
- Delete custom categories if needed
- Save changes

#### 4. **Configure App Lock**
- Go to Profile → App Lock & Fingerprint
- enable "App Lock"
- Set a 4-digit PIN
- Optionally enable Fingerprint or Face Recognition
- PIN will be required to open the app

#### 5. **Privacy Settings**
- Go to Profile → Privacy Mode
- Toggle "Privacy Mode" to hide financial data
- Configure which data to hide
- Control data collection preferences

### For Developers

#### Initialize User Preferences
```typescript
import { initializeUserPreferences } from '@/src/utils/initializePreferences';

// After successful login
await initializeUserPreferences();
```

#### Use Currency Throughout App
```typescript
import { formatCurrencySync, getCurrencySymbol } from '@/src/utils/currency';

// In components
const symbol = getCurrencySymbol(userCurrency); // '₹', '$', etc.
const formatted = formatCurrencySync(100, 'USD'); // '$100'
```

#### Check and Enable App Lock
```typescript
import { checkBiometricAvailability, authenticate } from '@/src/utils/appLock';

const bio = await checkBiometricAvailability();
if (bio.available && bio.types.includes('fingerprint')) {
  const success = await authenticate();
  if (success) {
    // User authenticated
  }
}
```

## 📋 Validation & Error Handling

### Payment Preferences
- ✅ At least one payment method required (UPI or Bank)
- ✅ UPI format validation
- ✅ Auto-pay toggle independent option

### Expense Categories
- ✅ At least one category must be enabled
- ✅ Custom categories can be added with any name
- ✅ Default categories cannot be deleted
- ✅ Custom categories show as editable/deletable

### App Lock
- ✅ PIN must be exactly 4 digits
- ✅ PIN is hashed on server (bcryptjs)
- ✅ Biometric features require app lock
- ✅ PIN change functionality available

### Privacy Settings
- ✅ Master privacy toggle depends on sub-toggles
- ✅ Data collection and analytics are independent
- ✅ All settings are optional

## 🔒 Security Notes

1. **PIN Storage**: PINs are hashed on the backend using bcryptjs with 10 salt rounds
2. **Biometric Data**: Never stored - only used locally via device APIs
3. **Data Transmission**: All preferences sent over HTTPS in production
4. **Token Required**: All profile endpoints require authentication token

## 📱 Testing Checklist

- [ ] Payment preferences save and load correctly
- [ ] Currency selection applies throughout app
- [ ] Theme switching works
- [ ] Custom categories can be added and deleted
- [ ] App lock PIN can be set and changed
- [ ] Fingerprint/Face recognition works (if device supports)
- [ ] Privacy mode hides correct data
- [ ] All changes persist after app restart
- [ ] Offline changes sync when online

## 🐛 Troubleshooting

### Currency not changing app-wide
- Clear app cache and restart
- Ensure currency is saved in both AsyncStorage and server
- Check `BalanceSummaryCard` is using currency utility

### App lock not working
- Ensure PIN is 4 digits (0-9 only)
- Check `expo-local-authentication` is installed
- Verify device has biometric capability for fingerprint/face

### Categories not saving
- Ensure at least one category is enabled
- Check network connectivity
- Verify API token is valid

## 📞 Support
For issues or questions, refer to the API route documentation in `Backend/API_ROUTES.md`
