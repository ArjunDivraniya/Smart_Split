# SmartSplit App

Expo Router app with file-based routing. All screens live under the app/ directory and are grouped by feature.

## Project Structure

```
smartsplit-app/
|
|-- app/
|   |-- _layout.tsx
|   |-- index.tsx
|   |-- (auth)/
|   |   |-- _layout.tsx
|   |   |-- onboarding.tsx
|   |   |-- login.tsx
|   |   |-- register.tsx
|   |-- (tabs)/
|   |   |-- _layout.tsx
|   |   |-- index.tsx
|   |   |-- groups.tsx
|   |   |-- friends.tsx
|   |   |-- analytics.tsx
|   |-- group/
|   |   |-- create.tsx
|   |   |-- [id].tsx
|   |   |-- add-expense.tsx
|   |   |-- expense/
|   |   |   |-- [id].tsx
|   |   |-- settlement.tsx
|   |-- personal/
|   |   |-- index.tsx
|   |   |-- add.tsx
|   |   |-- [id].tsx
|   |-- friends/
|   |   |-- [id].tsx
|   |   |-- settle.tsx
|   |-- budget/
|   |   |-- index.tsx
|   |   |-- set.tsx
|   |-- analytics/
|   |   |-- [category].tsx
|   |-- notifications.tsx
|   |-- profile/
|   |   |-- index.tsx
|   |   |-- edit.tsx
|   |   |-- preferences.tsx
|   |   |-- export.tsx
|
|-- src/
|   |-- components/
|   |   |-- ui/
|   |   |-- layout/
|   |   |-- dashboard/
|   |   |-- groups/
|   |   |-- expenses/
|   |   |-- friends/
|   |   |-- analytics/
|   |   |-- notifications/
|   |-- services/
|   |-- context/
|   |-- hooks/
|   |-- constants/
|   |-- types/
|   |-- utils/
|
|-- assets/
|   |-- fonts/
|   |-- images/
|
|-- app.json
|-- tsconfig.json
|-- package.json
```

## Routing Rules

- app/index.tsx is the splash screen. It redirects to /(auth)/login or /(tabs).
- Screens inside app/(auth) do not show the tab bar.
- Screens inside app/(tabs) are the main app tabs.

## Start

1. Install dependencies

```bash
npm install
```

2. Start the app

```bash
npx expo start
```
