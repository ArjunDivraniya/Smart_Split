import mongoose from 'mongoose';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Budget from '../models/Budget.model';
import PersonalExpense from '../models/PersonalExpense.model';

const parseMonthYear = (monthRaw: any, yearRaw: any): { month: number; year: number } => {
  const now = new Date();
  const month = Number(monthRaw || now.getMonth() + 1);
  const year = Number(yearRaw || now.getFullYear());

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error('Invalid month. Use 1-12');
  }

  if (!Number.isInteger(year) || year < 2000 || year > 3000) {
    throw new Error('Invalid year');
  }

  return { month, year };
};

const getMonthDateRange = (month: number, year: number) => {
  // Use UTC boundaries adjusted for IST (+5:30)
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  start.setMinutes(start.getMinutes() - 330);

  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  end.setMinutes(end.getMinutes() - 330);

  return { start, end };
};

// POST /api/budgets
export const createBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { category, limit, month, year } = req.body || {};

    if (!category || limit === undefined || month === undefined || year === undefined) {
      return res.status(400).json({ success: false, message: 'category, limit, month, and year are required' });
    }

    const normalizedCategory = String(category).trim();
    const parsedLimit = Number(limit);
    const parsedMonth = Number(month);
    const parsedYear = Number(year);

    if (!normalizedCategory) {
      return res.status(400).json({ success: false, message: 'category cannot be empty' });
    }

    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({ success: false, message: 'limit must be a positive number' });
    }

    if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({ success: false, message: 'Invalid month. Use 1-12' });
    }

    if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 3000) {
      return res.status(400).json({ success: false, message: 'Invalid year' });
    }

    const existing = await Budget.findOne({ user: userId, category: normalizedCategory, month: parsedMonth, year: parsedYear });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Budget already exists for this category and month' });
    }

    const created = await Budget.create({
      user: userId,
      category: normalizedCategory,
      limit: parsedLimit,
      month: parsedMonth,
      year: parsedYear,
    });

    return res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    console.error('Create budget error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create budget' });
  }
};

// GET /api/budgets/status
export const getBudgetStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!mongoose.Types.ObjectId.isValid(String(userId))) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    const { month, year } = parseMonthYear(req.query.month, req.query.year);
    const { start, end } = getMonthDateRange(month, year);

    const budgets = await Budget.find({ user: userId, month, year }).lean();

    const spendRows = await PersonalExpense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(String(userId)),
          expenseDate: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: '$category',
          spent: { $sum: '$amount' },
        },
      },
    ]);

    const spentByCategory = new Map<string, number>();
    spendRows.forEach((row: any) => {
      spentByCategory.set(String(row._id), Number(row.spent || 0));
    });

    const data = budgets.map((budget: any) => {
      const spent = Number((spentByCategory.get(String(budget.category)) || 0).toFixed(2));
      const limit = Number(budget.limit || 0);
      const remaining = Number((limit - spent).toFixed(2));
      const percentage = limit > 0 ? Number(((spent / limit) * 100).toFixed(2)) : 0;

      return {
        id: String(budget._id),
        category: String(budget.category),
        limit,
        spent,
        remaining,
        percentage,
        alert: percentage > 80,
        month: Number(budget.month),
        year: Number(budget.year),
      };
    });

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Get budget status error:', error);
    const statusCode = typeof error?.message === 'string' && error.message.startsWith('Invalid') ? 400 : 500;
    return res.status(statusCode).json({ success: false, message: error.message || 'Failed to fetch budget status' });
  }
};

// PUT /api/budgets/:id
export const updateBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { limit } = req.body || {};

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const parsedLimit = Number(limit);
    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({ success: false, message: 'limit must be a positive number' });
    }

    const budget = await Budget.findById(id);
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    if (String(budget.user) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Not allowed to update this budget' });
    }

    budget.limit = parsedLimit;
    await budget.save();

    return res.status(200).json({ success: true, data: budget });
  } catch (error: any) {
    console.error('Update budget error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to update budget' });
  }
};

// DELETE /api/budgets/:id
export const deleteBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const budget = await Budget.findById(id);
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    if (String(budget.user) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Not allowed to delete this budget' });
    }

    await Budget.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Budget deleted successfully' });
  } catch (error: any) {
    console.error('Delete budget error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete budget' });
  }
};
