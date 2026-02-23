import { Response } from 'express';
import Expense from '../models/Expense.model';
import Trip from '../models/Trip.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendNotification } from '../utils/notification';

// Add Expense
export const addExpense = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { tripId, title, amount, category, paidBy, splitBetween, splitType, splitAmounts } = req.body;

    if (!tripId || !title || !amount || !paidBy || !splitBetween || splitBetween.length === 0) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const newExpense = new Expense({
      trip: tripId,
      title,
      amount: Number(amount),
      category,
      paidBy,
      splitBetween,
      splitType: splitType || 'equally',
      splitAmounts: splitAmounts || {},
    });

    const savedExpense = await newExpense.save();

    await Trip.findByIdAndUpdate(tripId, {
      $push: { expenses: savedExpense._id },
    });

    // Notify members
    await sendNotification(splitBetween, userId!, tripId, `Added expense "${title}" of ₹${amount}`, 'expense');

    return res.status(201).json({
      message: 'Expense added successfully',
      success: true,
      data: savedExpense,
    });
  } catch (error: any) {
    console.error('Add expense error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update Expense
export const updateExpense = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.paidBy.toString() !== userId) {
      return res.status(403).json({ message: 'Only the expense creator can edit this expense' });
    }

    const { title, amount, category, splitBetween, splitType, splitAmounts, splitPercentages, splitShares } = req.body;

    if (!title || !amount || !splitBetween || splitBetween.length === 0) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    expense.title = title;
    expense.amount = Number(amount);
    expense.category = category;
    expense.splitBetween = splitBetween;
    expense.splitType = splitType || 'equally';

    if (splitAmounts) expense.splitAmounts = splitAmounts;
    if (splitPercentages) expense.splitPercentages = splitPercentages;
    if (splitShares) expense.splitShares = splitShares;

    await expense.save();

    await sendNotification(splitBetween, userId!, expense.trip.toString(), `Updated expense "${title}" to ₹${amount}`, 'expense');

    return res.status(200).json({
      message: 'Expense updated successfully',
      success: true,
      data: expense,
    });
  } catch (error: any) {
    console.error('Update expense error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete Expense
export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.paidBy.toString() !== userId) {
      return res.status(403).json({ message: 'Only the expense creator can delete this expense' });
    }

    const tripId = expense.trip;
    const expenseTitle = expense.title;

    await Trip.findByIdAndUpdate(tripId, {
      $pull: { expenses: id },
    });

    await Expense.findByIdAndDelete(id);

    await sendNotification(expense.splitBetween.map(id => id.toString()), userId!, tripId.toString(), `Deleted expense "${expenseTitle}"`, 'expense');

    return res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete expense error:', error);
    return res.status(500).json({ message: error.message });
  }
};
