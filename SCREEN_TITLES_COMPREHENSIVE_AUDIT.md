# SmartSplit Mobile App - Screen Titles Comprehensive Audit
**Date:** March 29, 2026  
**Scope:** Complete audit of screen title definitions, styling, and configurations

---

## Summary

This document catalogs every screen with a title in the SmartSplit Mobile App, including:
- File paths with line numbers
- Current font styling (fontFamily, fontSize, fontWeight, color)
- Header configuration approach (Stack Navigator, Tab Navigator, or Custom Header)
- Style definitions location

---

## Table of Contents
1. [Global/Default Header Options](#global-default-header-options)
2. [Main Tab Screen Titles](#main-tab-screen-titles)
3. [Stack Navigator Screens](#stack-navigator-screens)
4. [Custom Header Implementations](#custom-header-implementations)
5. [Inconsistencies Found](#inconsistencies-found)
6. [Recommendations](#recommendations)

---

## Global/Default Header Options

### 📄 `src/utils/screenOptions.ts`

**Location:** [src/utils/screenOptions.ts](src/utils/screenOptions.ts#L1-L50)

#### Default header options used across all Stack screens:

```
customHeaderOptions (Lines 7-18):
- fontFamily: 'Syne_700Bold'
- fontSize: 20
- fontWeight: '700'
- color: '#F0F0FF'
- backgroundColor: '#14141F'
- headerTintColor: '#7C5CFC'
```

```
createHeaderOptions function (Lines 23-32):
- fontFamily: 'Syne_700Bold'
- fontSize: 18
- fontWeight: '700'
- color: '#F0F0FF'
```

```
subtitleStyle (Lines 35-40):
- fontFamily: 'DMSans_500Medium'
- fontSize: 14
- color: '#A0A0BF'
```

---

## Main Tab Screen Titles

These are the primary navigation tabs in the app (`app/(tabs)/_layout.tsx`).

### 1. Home Screen (Dashboard)
**File:** [app/(tabs)/index.tsx](app/(tabs)/index.tsx)

**Header Configuration:** Custom header (headerShown: false in layout)

**Title:** "Home" (displayed via custom header component)
- Line 217-234: Activity feed items with titles
- Line 583: `subtitle` style - fontSize: 16, color: #A0A0BF, fontFamily: DMSans_400Regular

**Greeting Header:** "Good [time]!" 
- No specific title Text component found as main header

---

### 2. Groups Screen
**File:** [app/(tabs)/groups.tsx](app/(tabs)/groups.tsx#L287-L310)

**Header Configuration:** Custom header (headerShown: false)

**Screen Title:** "Groups" or "Select Group"
- **Location:** Lines 287-310 (styles)
- **Styling:**
  - `headerTitle` (Line 289-293):
    - fontSize: 28
    - fontWeight: '800'
    - fontFamily: 'Syne_700Bold'
    - color: '#F0F0FF'
  - `headerSubtitle` (Line 294-299):
    - fontSize: 12
    - marginTop: 4
    - fontFamily: 'DMSans_400Regular'

---

### 3. Friends Screen
**File:** [app/(tabs)/friends.tsx](app/(tabs)/friends.tsx#L270-L310)

**Header Configuration:** Custom header (headerShown: false)

**Screen Title:** "Friends"
- **Location:** Lines 270-310 (styles)
- **Styling:**
  - `headerTitle` (Line 279-281):
    - color: #F0F0FF (from COLORS.textPrimary)
    - fontSize: 28
    - fontFamily: 'Syne_700Bold'

---

### 4. Analytics Screen
**File:** [app/(tabs)/analytics.tsx](app/(tabs)/analytics.tsx#L371-L390)

**Header Configuration:** Custom header (headerShown: false)

**Screen Title:** "Analytics"
- **Location:** Lines 371-390 (styles)
- **Styling:**
  - `headerTitle` (Line 372-378):
    - color: '#F0F0FF'
    - fontSize: 28
    - fontFamily: 'Syne_700Bold'
    - fontWeight: '700'
    - flex: 1
    - textAlign: 'center'

---

## Stack Navigator Screens

These screens use the Stack Navigator with custom or default header options.

### 5. Profile Screen (Main)
**File:** [app/profile/index.tsx](app/profile/index.tsx#L390-L420)

**Header Configuration:** Custom header (headerShown: false)

**Screen Title:** "Profile"
- **Location:** Lines 390-420 (styles)
- **Styling:**
  - `headerTitle` (Line 394-399):
    - color: #F0F0FF (from COLORS.textPrimary)
    - fontSize: 20
    - fontFamily: 'Syne_700Bold'
    - fontWeight: '700'

---

### 6. Profile Edit Screen
**File:** [app/profile/edit.tsx](app/profile/edit.tsx#L588-L610)

**Header Configuration:** Custom header (headerShown: false)

**Screen Title:** "Edit Profile"
- **Location:** Lines 588-610 (styles)
- **Styling:**
  - `headerTitle` (Line 589-594):
    - color: #F0F0FF (from COLORS.textPrimary)
    - fontSize: 18
    - fontFamily: 'Syne_700Bold'
    - fontWeight: '700'

---

### 7. Budget Screen
**File:** [app/budget/index.tsx](app/budget/index.tsx#L449-L470)

**Header Configuration:** Custom header (headerShown: false)

**Screen Title:** "Budget"
- **Location:** Lines 449-470 (styles)
- **Styling:**
  - `headerTitle` (Line 450-453):
    - color: #F0F0FF (from COLORS.textPrimary)
    - fontSize: 20
    - fontFamily: 'Syne_700Bold'

---

### 8. Settlements Screen
**File:** [app/settlements/index.tsx](app/settlements/index.tsx#L433-L450)

**Header Configuration:** Custom header (headerShown: false)

**Screen Title:** "Settlements"
- **Location:** Lines 433-450 (styles)
- **Styling:**
  - `headerTitle` (Line 434-437):
    - color: '#F3F3FF'
    - fontFamily: 'Syne_700Bold'
    - fontSize: 20

---

### 9. Analytics Category Detail
**File:** [app/analytics/[category].tsx](app/analytics/[category].tsx#L324-L340)

**Header Configuration:** Custom header (headerShown: false)

**Screen Title:** Category name (e.g., "Food", "Transport")
- **Location:** Lines 324-340 (styles)
- **Styling:**
  - `headerTitle` (Line 325-328):
    - color: #F0F0FF (from COLORS.textPrimary)
    - fontSize: 18
    - fontFamily: 'Syne_700Bold'

---

### 10. Personal Expenses Screen
**File:** [app/personal/index.tsx](app/personal/index.tsx#L362-L380)

**Header Configuration:** Custom header (headerShown: false)

**Screen Title:** "Personal Expenses"
- **Location:** Line 252 (rendered as Text with styles.headerTitle)
- **Styles Location:** Lines 362-380 (styles definition)
- **Styling:**
  - `headerTitle` (Line 363-368):
    - color: #F0F0FF (from COLORS.textPrimary)
    - fontSize: 23
    - fontFamily: 'Syne_800ExtraBold'
    - letterSpacing: -0.3

---

### 11. Notifications Screen
**File:** [app/notifications.tsx](app/notifications.tsx#L270-L290)

**Header Configuration:** Custom header (headerShown: false)

**Screen Title:** "Notifications"
- **Location:** Lines 121 & 144 (rendered as Text with styles.title)
- **Styles Location:** Lines 275-290 (styles definition)
- **Styling:**
  - `title` (Line 276-283):
    - color: '#F0F0FF'
    - fontSize: 24
    - fontFamily: 'Syne_700Bold'
    - fontWeight: '700'
    - flex: 1
    - textAlign: 'center'

---

## Custom Header Implementations

### 12. Group Detail Screen
**File:** [app/group/[id].tsx](app/group/[id].tsx#L1026-L1120)

**Header Configuration:** Custom header (headerShown: false)

**Screen Title:** Group name (rendered in custom hero section)
- **Location:** Lines 696-710 (rendered)
- **Styles Location:** Lines 1026-1120 (styles definition)
- **Styling:**
  - `groupNameHero` (Line 1072-1075):
    - fontSize: 24
    - fontFamily: 'Syne_700Bold'
    - marginBottom: 6

**Note:** This screen has an elaborate custom header with group emoji, badges, and stats instead of a simple title bar.

---

### 13. Group Create Screen
**File:** [app/group/create.tsx](app/group/create.tsx#L473-L490)

**Header Configuration:** Custom header (headerShown: false)

**Screen Title:** "Create Group" with step indicator
- **Location:** Lines 473-490 (styles definition)
- **Styling:**
  - `headerTitle` (Line 474-476):
    - fontSize: 18
    - fontFamily: 'Syne_700Bold'
  - `stepCounter` (Line 477-480):
    - fontSize: 13
    - fontFamily: 'DMSans_500Medium'

---

### 14. Group Add Expense Screen
**File:** [app/group/add-expense.tsx](app/group/add-expense.tsx#L700-L730)

**Header Configuration:** Custom modal header

**Screen Title:** "Add Expense" (in header)
- **Location:** Lines 700-730 (styles definition)
- **Styling:**
  - `headerTitle` (Line 714-717):
    - fontSize: 18
    - fontWeight: '700'
    - color: '#1e293b'

---

### 15. Group Settlement Screen
**File:** [app/group/settlement.tsx](app/group/settlement.tsx#L490-L520)

**Header Configuration:** Custom header (headerShown: false)

**Screen Title:** "Settle Up"
- **Location:** Lines 275-285 (rendered)
- **Styles Location:** Lines 490-520 (styles definition)
- **Styling:**
  - `headerTitle` (Line 499-502):
    - fontSize: 18
    - fontFamily: 'Syne_700Bold'
    - fontWeight: '700'

---

### 16. Friend Detail Screen
**File:** [app/friends/[id].tsx](app/friends/[id].tsx#L200-L290)

**Header Configuration:** Custom header (headerShown: false)

**Screen Title:** Friend name
- **Location:** Lines 233-240 (rendered)
- **Styles Location:** Lines 250-290 (styles definition)
- **Styling:**
  - `headerTitle` (Line 258-260):
    - color: #F3F3FF (from COLORS.textPrimary)
    - fontSize: 28
    - fontFamily: 'Syne_700Bold'

---

## Style Inconsistencies Found

### ⚠️ Font Size Variations for Main Titles

| Screen | fontSize | fontFamily | fontWeight | color |
|--------|----------|-----------|-----------|-------|
| Groups | 28 | Syne_700Bold | 800 | #F0F0FF |
| Friends | 28 | Syne_700Bold | (default) | #F0F0FF |
| Analytics | 28 | Syne_700Bold | 700 | #F0F0FF |
| Personal Expenses | 23 | Syne_800ExtraBold | (default) | #F0F0FF |
| Notifications | 24 | Syne_700Bold | 700 | #F0F0FF |
| Friend Detail | 28 | Syne_700Bold | (default) | #F3F3FF |
| Group Name Hero | 24 | Syne_700Bold | (default) | (dynamic) |
| Profile | 20 | Syne_700Bold | 700 | #F0F0FF |
| Budget | 20 | Syne_700Bold | (default) | #F0F0FF |
| Settlements | 20 | Syne_700Bold | (default) | #F3F3FF |

### 🔴 Inconsistencies Identified:

1. **Font Size:** Main tab screens use fontSize 28, but detail screens use 18-24
2. **Font Weight:** Some specify fontWeight '700' or '800', others rely on font file weight
3. **Color Variation:** Most use #F0F0FF, but some use #F3F3FF (settlements, friend detail)
4. **Font Variant:** Personal Expenses uses Syne_800ExtraBold instead of Syne_700Bold
5. **Design Pattern:** No consistent pattern for main screens vs detail screens

---

## Recommendations

### 1. **Standardize Main Tab Titles**
All primary navigation tabs (Groups, Friends, Analytics, Personal, Settlements) should use:
- **fontSize:** 28
- **fontFamily:** 'Syne_700Bold'
- **fontWeight:** '700'
- **color:** '#F0F0FF'

### 2. **Standardize Detail Screen Titles**
All nested/detail screens should use:
- **fontSize:** 20
- **fontFamily:** 'Syne_700Bold'
- **fontWeight:** '700'
- **color:** '#F0F0FF'

### 3. **Color Consistency**
Replace #F3F3FF variations with standard #F0F0FF across all screens.

### 4. **Centralize Title Styles**
Move all title style definitions to `src/constants/theme.ts` instead of defining them locally in each screen:

```typescript
export const TITLE_STYLES = {
  mainTab: {
    fontSize: 28,
    fontFamily: 'Syne_700Bold',
    fontWeight: '700' as const,
    color: '#F0F0FF',
  },
  detail: {
    fontSize: 20,
    fontFamily: 'Syne_700Bold',
    fontWeight: '700' as const,
    color: '#F0F0FF',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: '#A0A0BF',
  },
};
```

### 5. **Update screenOptions.ts**
Align the default header options with the new standardized values.

### 6. **Create Title Component**
Create a reusable `ScreenTitle` component to ensure consistency:

```typescript
interface ScreenTitleProps {
  text: string;
  subtitle?: string;
  size?: 'main' | 'detail';
}

export const ScreenTitle: React.FC<ScreenTitleProps> = ({
  text,
  subtitle,
  size = 'main',
}) => {
  const style = size === 'main' ? TITLE_STYLES.mainTab : TITLE_STYLES.detail;
  return (
    <View>
      <Text style={style}>{text}</Text>
      {subtitle && <Text style={TITLE_STYLES.subtitle}>{subtitle}</Text>}
    </View>
  );
};
```

---

## Files Requiring Updates

- [src/utils/screenOptions.ts](src/utils/screenOptions.ts) - Global header options
- [src/constants/theme.ts](src/constants/theme.ts) - Central style definitions (NEW)
- [app/(tabs)/groups.tsx](app/(tabs)/groups.tsx) - Standardize headerTitle
- [app/(tabs)/friends.tsx](app/(tabs)/friends.tsx) - Standardize headerTitle
- [app/(tabs)/analytics.tsx](app/(tabs)/analytics.tsx) - Standardize headerTitle
- [app/personal/index.tsx](app/personal/index.tsx) - Standardize headerTitle
- [app/notifications.tsx](app/notifications.tsx) - Standardize title
- [app/settlements/index.tsx](app/settlements/index.tsx) - Update color to #F0F0FF
- [app/friends/[id].tsx](app/friends/[id].tsx) - Update color to #F0F0FF

---

## Notes

- All screens use the SafeAreaView for proper layout
- Most screens have headerShown: false and implement custom headers
- The Stack Navigator is configured in [app/_layout.tsx](app/_layout.tsx) with customHeaderOptions as default
- Tab screens are configured in [app/(tabs)/_layout.tsx](app/(tabs)/_layout.tsx)
- Layout files: [app/profile/_layout.tsx](app/profile/_layout.tsx), [app/group/_layout.tsx](app/group/_layout.tsx), [app/budget/_layout.tsx](app/budget/_layout.tsx), [app/settlements/_layout.tsx](app/settlements/_layout.tsx)

---

**End of Report**
