import { Stack } from 'expo-router';

export default function GroupLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="create"
        options={{
          title: 'Create Group',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Group Details',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="expense/[id]"
        options={{
          title: 'Expense Details',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="settlement"
        options={{
          title: 'Settle Up',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
