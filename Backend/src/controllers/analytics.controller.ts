import { Response } from 'express';
import Expense from '../models/Expense.model';
import Trip from '../models/Trip.model';
import { AuthRequest } from '../middleware/auth.middleware';

// Category to Emoji mapping
const CATEGORY_EMOJIS: Record<string, string> = {
  food: '🍔',
  transport: '🚗',
  accommodation: '🏨',
  entertainment: '🎬',
  shopping: '🛍️',
  groceries: '🛒',
  health: '💊',
  utilities: '💡',
  other: '📦',
};

// Get Analytics Data for a specific trip
export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const expenses = await Expense.find({ trip: id }).populate('paidBy', 'name');

    // Category Breakdown
    const categoryData: Record<string, number> = {};
    // Spending by Member
    const memberSpending: Record<string, number> = {};

    let totalSpent = 0;

    expenses.forEach((expense: any) => {
      // Category Sum
      const cat = expense.category || 'other';
      categoryData[cat] = (categoryData[cat] || 0) + expense.amount;

      // Member Sum
      const payerName = expense.paidBy.name;
      memberSpending[payerName] = (memberSpending[payerName] || 0) + expense.amount;

      totalSpent += expense.amount;
    });

    // Format for Recharts
    const pieData = Object.keys(categoryData).map((key) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: categoryData[key],
    }));

    const barData = Object.keys(memberSpending).map((key) => ({
      name: key.split(' ')[0], // First name only
      amount: memberSpending[key],
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalSpent,
        pieData,
        barData,
      },
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get Recent Activity - Last 10 expenses across all user's trips
export const getRecentActivity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find all trips where user is a member or creator
    const userTrips = await Trip.find({
      $or: [
        { createdBy: userId },
        { 'members.userId': userId },
      ],
    }).select('_id');

    const tripIds = userTrips.map(trip => trip._id);

    // Get last 10 expenses from these trips
    const expenses = await Expense.find({ trip: { $in: tripIds } })
      .sort({ date: -1 })
      .limit(10)
      .populate('paidBy', 'name email')
      .populate('trip', 'name');

    // Format for mobile app
    const activities = expenses.map((expense: any) => {
      const isPaidByCurrentUser = expense.paidBy._id.toString() === userId;
      const userName = expense.paidBy.name;
      const tripName = expense.trip?.name || 'Unknown Trip';

      return {
        id: expense._id.toString(),
        name: userName,
        description: `${expense.title} • ${tripName}`,
        amount: expense.amount,
        type: isPaidByCurrentUser ? 'paid' : 'owe',
        date: expense.date,
        category: expense.category,
        avatarLabel: userName.charAt(0).toUpperCase(),
        avatarColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2)`,
      };
    });

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error: any) {
    console.error('Get recent activity error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get Dashboard Insights - Top spending category
export const getDashboardInsights = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find all trips where user is a member or creator
    const userTrips = await Trip.find({
      $or: [
        { createdBy: userId },
        { 'members.userId': userId },
      ],
    }).select('_id');

    const tripIds = userTrips.map(trip => trip._id);

    // Get all expenses from user's trips
    const expenses = await Expense.find({ trip: { $in: tripIds } });

    // Calculate category totals
    const categoryTotals: Record<string, number> = {};
    let totalSpent = 0;

    expenses.forEach((expense) => {
      const category = expense.category || 'other';
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
      totalSpent += expense.amount;
    });

    // Find top category
    let topCategory = 'food';
    let topAmount = 0;

    Object.entries(categoryTotals).forEach(([category, amount]) => {
      if (amount > topAmount) {
        topAmount = amount;
        topCategory = category;
      }
    });

    const percentage = totalSpent > 0 ? ((topAmount / totalSpent) * 100).toFixed(1) : '0';

    return res.status(200).json({
      success: true,
      data: {
        name: topCategory.charAt(0).toUpperCase() + topCategory.slice(1),
        amount: topAmount,
        emoji: CATEGORY_EMOJIS[topCategory] || '📦',
        percentage: parseFloat(percentage),
        totalSpent,
      },
    });
  } catch (error: any) {
    console.error('Get dashboard insights error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get Dashboard Summary - Financial overview and smart alerts
export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find all trips where user is a member or creator
    const userTrips = await Trip.find({
      $or: [
        { createdBy: userId },
        { 'members.userId': userId },
      ],
    }).select('_id name status');

    const tripIds = userTrips.map(trip => trip._id);

    // Get all expenses from user's trips
    const expenses = await Expense.find({ trip: { $in: tripIds } })
      .populate('paidBy', '_id name');

    // Calculate financial summary
    let totalOwe = 0;
    let totalGet = 0;
    let monthlySpend = 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    expenses.forEach((expense: any) => {
      const isPaidByUser = expense.paidBy._id.toString() === userId;
      const expenseDate = new Date(expense.date);
      
      // Calculate monthly spend
      if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
        if (isPaidByUser) {
          monthlySpend += expense.amount;
        }
      }

      // Calculate owe/get (simplified - assuming equal splits)
      if (expense.splitBetween && expense.splitBetween.length > 0) {
        const splitAmount = expense.amount / expense.splitBetween.length;
        
        if (isPaidByUser) {
          // User paid, so others owe them
          totalGet += expense.amount - splitAmount;
        } else {
          // Someone else paid, user owes them
          const userInSplit = expense.splitBetween.some(
            (memberId: any) => memberId.toString() === userId
          );
          if (userInSplit) {
            totalOwe += splitAmount;
          }
        }
      }
    });

    // Generate smart alert
    let smartAlert = null;

    if (totalOwe > 0) {
      smartAlert = {
        type: 'warning',
        icon: '⚠️',
        message: `You have ₹${totalOwe.toLocaleString('en-IN')} pending settlements.`,
        borderColor: '#FF5F7E',
      };
    } else if (monthlySpend > 10000) {
      smartAlert = {
        type: 'info',
        icon: '💰',
        message: `You've spent ₹${monthlySpend.toLocaleString('en-IN')} this month!`,
        borderColor: '#FFB547',
      };
    } else if (userTrips.length === 0) {
      smartAlert = {
        type: 'info',
        icon: '🎯',
        message: 'Create your first trip to start tracking expenses!',
        borderColor: '#7C5CFC',
      };
    } else if (totalGet > 0) {
      smartAlert = {
        type: 'success',
        icon: '🎉',
        message: `Great! People owe you ₹${totalGet.toLocaleString('en-IN')}!`,
        borderColor: '#00E5B0',
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        financial: {
          totalOwe: Math.round(totalOwe),
          totalGet: Math.round(totalGet),
          monthlySpend: Math.round(monthlySpend),
        },
        smartAlert,
        tripCount: userTrips.length,
        activeTrips: userTrips.filter(trip => trip.status === 'active').length,
      },
    });
  } catch (error: any) {
    console.error('Get dashboard summary error:', error);
    return res.status(500).json({ message: error.message });
  }
};
