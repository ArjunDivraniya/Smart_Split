import { Response } from 'express';
import Expense from '../models/Expense.model';
import { AuthRequest } from '../middleware/auth.middleware';

// Get Analytics Data
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
