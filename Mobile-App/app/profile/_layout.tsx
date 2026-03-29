import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="payment-history" />
      <Stack.Screen name="theme" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="budget" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="currency" />
      <Stack.Screen name="export" />
      <Stack.Screen name="security-lock" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="privacy" />
    </Stack>
  );
}
