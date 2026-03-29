# Screen Title Font Styling - Implementation Guide

## Overview
Fixed all screen titles throughout the app to use custom fonts (Syne, DMSans) instead of default system fonts. This ensures consistent, branded typography across all screens.

## Changes Made

### 1. **Created Screen Options Utility** (`src/utils/screenOptions.ts`)
- Created `customHeaderOptions` object with consistent header styling
- Font: `Syne_700Bold` for titles (bold, branded look)
- Colors: `#F0F0FF` text on `#14141F` background (dark theme)
- Created `createHeaderOptions(title)` helper for quick title-specific options
- Added styling constants for subtitles and back button labels

### 2. **Applied Custom Headers to Root Layout** (`app/_layout.tsx`)
- Import: Added `customHeaderOptions` from `src/utils/screenOptions`
- Applied `screenOptions={customHeaderOptions}` to root Stack navigator
- This provides fallback styling for all nested Stack screens
- Updated modal screen to show header with custom fonts

### 3. **Enabled Headers on Group Screens** (`app/group/_layout.tsx`)
- Create Group: `headerShown: true` + custom fonts
- Group Details: `headerShown: true` + custom fonts
- Expense Details: `headerShown: true` + custom fonts (modal)
- Settle Up: `headerShown: true` + custom fonts
- Inline Text titles still use custom fonts as fallback

### 4. **Fixed Font References in Groups Screen** (`app/(tabs)/groups.tsx`)
- Replaced generic `fontFamily: 'Syne'` with `Syne_700Bold` (specific weight)
- Fixed `headerTitle` style
- Fixed `emptyTitle` style
- Ensures fonts load properly instead of falling back to system fonts

## Font Family Overview

### Loaded Custom Fonts (from `app/_layout.tsx`)
The following fonts are loaded via expo-google-fonts:
- **DM Sans** (body/detail text)
  - `DMSans_400Regular` - Default body text
  - `DMSans_500Medium` - Medium weight text
  - `DMSans_600SemiBold` - Semi-bold labels
  - `DMSans_700Bold` - Bold text/CTAs

- **Syne** (headings/titles)
  - `Syne_400Regular` - Light headings
  - `Syne_600SemiBold` - Semi-bold headings
  - `Syne_700Bold` - Standard heading weight (MOST USED)
  - `Syne_800ExtraBold` - Extra bold titles

### Recommended Usage
```
Screen Titles/Headers:     Syne_700Bold or Syne_800ExtraBold
Section Headers:           Syne_700Bold
Subtitles:                DMSans_500Medium or DMSans_400Regular
Body Text:                DMSans_400Regular
Labels:                   DMSans_600SemiBold
CTAs/Buttons:             Syne_700Bold or DMSans_700Bold
```

## Screens with Custom Headers Enabled

| Screen | File | Title | Font |
|--------|------|-------|------|
| Create Group | `app/group/create.tsx` | "Create Group" | Syne_700Bold |
| Group Details | `app/group/[id].tsx` | "Group Details" | Syne_700Bold |
| Expense Details | `app/group/expense/[id].tsx` | "Expense Details" | Syne_700Bold |
| Settle Up | `app/group/settlement.tsx` | "Settle Up" | Syne_700Bold |
| Modal | `app/modal.tsx` | "Modal" | Syne_700Bold |

## Screens with Inline Title Text (No Headers)

These screens render titles as custom Text components within the screen:
- Home Tab (`app/(tabs)/index.tsx`) - Greeting + userName
- Groups Tab (`app/(tabs)/groups.tsx`) - "Groups" with subtitle
- Friends Tab (`app/(tabs)/friends.tsx`) - "Friends" header
- Analytics Tab (`app/(tabs)/analytics.tsx`) - "Analytics" header
- Settlements (`app/settlements/index.tsx`) - "Settlements" header
- Notifications (`app/notifications.tsx`) - "Notifications" header
- Profile screens (`app/profile/**/*.tsx`) - Multiple headers
- Personal screens (`app/personal/**/*.tsx`) - Multiple headers

All inline titles already use custom fonts:
- Main titles: `Syne_700Bold` or `Syne_800ExtraBold`
- Subtitles: `DMSans_400Regular` or `DMSans_500Medium`

## Verification Checklist

✅ All 10+ screens have proper font families specified
✅ No generic `fontFamily: 'Syne'` (would fall back to system font)
✅ All specific font variants are properly loaded via expo-google-fonts
✅ TypeScript compilation passes with zero errors
✅ Group layout screens show native headers with custom fonts
✅ Modal screen shows header with custom fonts
✅ Root layout applies custom styles as fallback
✅ All inline text titles use custom fonts
✅ Color scheme matches app theme (dark mode colors)

## How to Add Custom Fonts to New Screens

### Option 1: Using Stack Headers (Recommended for Modal/Navigation flows)
```tsx
import { createHeaderOptions } from '@/src/utils/screenOptions';

<Stack.Screen
  name="my-screen"
  options={createHeaderOptions('My Screen Title')}
/>
```

### Option 2: Using Inline Text (Recommended for Tab content)
```tsx
<Text style={{
  fontSize: 24,
  fontFamily: 'Syne_700Bold',  // or Syne_800ExtraBold
  color: '#F0F0FF',
}}>
  Screen Title
</Text>
```

### Option 3: Custom Header Component
```tsx
import { customHeaderOptions } from '@/src/utils/screenOptions';

<Stack.Screen
  name="my-screen"
  options={{
    ...customHeaderOptions,
    title: 'My Screen Title',
    headerShown: true,
  }}
/>
```

## Files Modified

1. ✅ `src/utils/screenOptions.ts` - CREATED (new utility)
2. ✅ `app/_layout.tsx` - Updated (added customHeaderOptions import & usage)
3. ✅ `app/group/_layout.tsx` - Updated (enabled headers with custom options)
4. ✅ `app/(tabs)/groups.tsx` - Updated (fixed font variants)

## Testing

1. **Visual Test**: Run the app and check:
   - Group screens show titles in Syne_700Bold font
   - All tab headers display correct fonts
   - No system fonts appear in any titles

2. **TypeScript Test**: 
   ```bash
   cd Mobile-App
   npm run type-check  # Should pass with zero errors
   ```

3. **Runtime Test**:
   ```bash
   npm start  # or npx expo start
   # Navigate to Group screens to see headers
   # Check that fonts load properly without falling back
   ```

## Future Improvements

- Implement Socket.IO for true real-time header updates
- Add animated transitions between screens with header font changes
- Create header theme variants (light/dark mode optimization)
- Add header back button to all screens for consistency
