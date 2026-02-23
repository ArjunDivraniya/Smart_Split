// Mobile-App/src/utils/tripDayCalculator.ts

import { Expense, TripDay, Group } from '@/src/types/group.types';

/**
 * Calculate which day of the trip an expense occurred on
 * Day 1 = trip start date, Day 2 = +1 day, etc.
 */
export function calculateTripDay(
  expenseDate: Date,
  tripStartDate: Date,
  tripEndDate: Date
): number {
  const start = new Date(tripStartDate);
  const expense = new Date(expenseDate);
  
  // Reset time to avoid timezone issues
  start.setHours(0, 0, 0, 0);
  expense.setHours(0, 0, 0, 0);
  
  const timeDiff = expense.getTime() - start.getTime();
  const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  // Ensure day is within trip bounds
  if (dayDiff < 0) return 1;
  
  const end = new Date(tripEndDate);
  end.setHours(0, 0, 0, 0);
  const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  return Math.min(dayDiff + 1, totalDays);
}

/**
 * Get trip duration in days
 */
export function getTripDuration(tripStartDate: Date, tripEndDate: Date): number {
  const start = new Date(tripStartDate);
  const end = new Date(tripEndDate);
  
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const timeDiff = end.getTime() - start.getTime();
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Generate trip days array with expenses
 */
export function generateTripDays(group: Group, expenses: Expense[]): TripDay[] {
  if (!group.tripStartDate || !group.tripEndDate) {
    return [];
  }

  const days: TripDay[] = [];
  const duration = getTripDuration(group.tripStartDate, group.tripEndDate);
  const dayMap = new Map<number, Expense[]>();

  // Categorize expenses by day
  expenses.forEach((expense) => {
    const day = calculateTripDay(
      expense.date,
      group.tripStartDate!,
      group.tripEndDate!
    );
    
    if (!dayMap.has(day)) {
      dayMap.set(day, []);
    }
    dayMap.get(day)!.push(expense);
  });

  // Create TripDay objects
  const startDate = new Date(group.tripStartDate);
  for (let i = 0; i < duration; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    
    const dayNum = i + 1;
    const dayExpenses = dayMap.get(dayNum) || [];
    const totalSpent = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    days.push({
      dayNumber: dayNum,
      date: currentDate,
      dayName: currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }),
      expenses: dayExpenses,
      totalSpent,
    });
  }

  return days;
}

/**
 * Get remaining budget for trip
 */
export function getTripBudgetStatus(
  tripBudget: number,
  totalExpenses: number
): {
  spent: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'exceeded';
} {
  const spent = totalExpenses;
  const remaining = tripBudget - spent;
  const percentage = (spent / tripBudget) * 100;

  let status: 'safe' | 'warning' | 'exceeded' = 'safe';
  if (percentage > 100) status = 'exceeded';
  else if (percentage > 80) status = 'warning';

  return {
    spent,
    remaining,
    percentage: Math.min(percentage, 100),
    status,
  };
}

/**
 * Format trip date range for display
 */
export function formatTripDateRange(
  startDate: Date,
  endDate: Date
): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startStr = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const endStr = end.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `${startStr} – ${endStr}`;
}

/**
 * Format trip summary
 */
export function formatTripSummary(group: Group): string {
  if (!group.tripStartDate || !group.tripEndDate) {
    return '';
  }

  const duration = getTripDuration(group.tripStartDate, group.tripEndDate);
  const dateRange = formatTripDateRange(group.tripStartDate, group.tripEndDate);

  return `${dateRange} · ${duration} day${duration > 1 ? 's' : ''}`;
}
