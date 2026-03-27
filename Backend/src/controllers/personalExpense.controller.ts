import { Response } from 'express';
import mongoose from 'mongoose';
import PersonalExpense from '../models/PersonalExpense.model';
import Notification from '../models/Notification.model';
import User from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';

const getMonthDateRange = (month: number, year: number) => {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 1, 0, 0, 0, 0);
  return { start, end };
};

const normalizeCategory = (value: string): string => value.trim().toLowerCase();

const getCategoryBudgetLimit = (user: any, category: string): number | null => {
  const categories = Array.isArray(user?.expenseCategories) ? user.expenseCategories : [];
  const target = normalizeCategory(category);

  const matched = categories.find((item: any) => {
    const name = String(item?.name || '').trim().toLowerCase();
    const id = String(item?.id || '').trim().toLowerCase();
    return name === target || id === target;
  });

  if (!matched) {
    return null;
  }

  const rawLimit = matched?.budgetLimit ?? matched?.budget ?? matched?.limit;
  const parsed = Number(rawLimit);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

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

const hasInvalidMonthYear = (error: any): boolean =>
  typeof error?.message === 'string' && error.message.startsWith('Invalid');

// POST /api/personal-expenses
export const createPersonalExpense = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!mongoose.Types.ObjectId.isValid(String(userId))) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    const { description, amount, category, paymentMethod, expenseDate, isRecurring, recurringType, note, receiptUrl } = req.body || {};

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Validate required fields
    if (!description || !category || amount === undefined || !paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        message: 'description, amount, category, and paymentMethod are required' 
      });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'amount must be a positive number' });
    }

    // Parse expenseDate
    const parsedExpenseDate = expenseDate ? new Date(expenseDate) : new Date();
    if (Number.isNaN(parsedExpenseDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid expenseDate' });
    }

    // Validate isRecurring and recurringType
    let parsedRecurringType: 'daily' | 'monthly' | 'weekly' | undefined;
    if (isRecurring === true) {
      if (!recurringType || !['daily', 'monthly', 'weekly'].includes(recurringType)) {
        return res.status(400).json({ 
          success: false, 
          message: 'If isRecurring is true, recurringType must be "daily", "monthly" or "weekly"' 
        });
      }
      parsedRecurringType = recurringType as 'daily' | 'monthly' | 'weekly';
    }

    const expenseData: any = {
      user: userId,
      description: String(description).trim(),
      amount: parsedAmount,
      category: String(category).trim(),
      paymentMethod: String(paymentMethod).trim(),
      expenseDate: parsedExpenseDate,
      isRecurring: Boolean(isRecurring) || false,
      note: String(note || '').trim(),
    };

    // Only add optional fields if explicitly provided
    if (parsedRecurringType !== undefined) {
      expenseData.recurringType = parsedRecurringType;
    }
    if (receiptUrl) {
      expenseData.receiptUrl = String(receiptUrl).trim();
    }

    const savedExpense = await PersonalExpense.create(expenseData);

    // Budget alert logic: notify once when monthly category spend crosses 80% threshold.
    const user = await User.findById(userId).select('expenseCategories preferences.notifications').lean();
    const budgetLimit = getCategoryBudgetLimit(user, String(category));

    if (budgetLimit && Number.isFinite(budgetLimit)) {
      const month = parsedExpenseDate.getMonth() + 1;
      const year = parsedExpenseDate.getFullYear();
      const { start, end } = getMonthDateRange(month, year);

      const [totals] = await PersonalExpense.aggregate([
        {
          $match: {
            user: savedExpense.user,
            category: savedExpense.category,
            expenseDate: { $gte: start, $lt: end },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]);

      const currentTotal = Number(totals?.total || 0);
      const previousTotal = Number((currentTotal - parsedAmount).toFixed(2));
      const threshold = Number((budgetLimit * 0.8).toFixed(2));

      const notificationsEnabled = user?.preferences?.notifications?.budgetAlert !== false;
      const crossedThreshold = previousTotal < threshold && currentTotal >= threshold;

      if (notificationsEnabled && crossedThreshold) {
        await Notification.create({
          recipient: userId,
          message: `Budget alert: ${savedExpense.category} spend reached ₹${currentTotal.toFixed(2)} (${Math.round((currentTotal / budgetLimit) * 100)}% of ₹${budgetLimit.toFixed(2)})`,
          type: 'budget_alert',
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Personal expense created successfully',
      data: savedExpense,
    });
  } catch (error: any) {
    console.error('Create personal expense error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create personal expense' });
  }
};

// GET /api/personal-expenses
export const getPersonalExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const category = String(req.query.category || '').trim();
    const { month, year } = parseMonthYear(req.query.month, req.query.year);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const page = Math.max(1, Number(req.query.page) || 1);
    const skip = (page - 1) * limit;
    const { start, end } = getMonthDateRange(month, year);

    const query: Record<string, any> = {
      user: userId,
      expenseDate: { $gte: start, $lt: end },
    };

    if (category) {
      query.category = category;
    }

    const [expenses, total] = await Promise.all([
      PersonalExpense.find(query)
        .sort({ expenseDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PersonalExpense.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        expenses,
        pagination: {
          page,
          limit,
          total,
          hasMore: skip + limit < total,
        },
      },
    });
  } catch (error: any) {
    console.error('Get personal expenses error:', error);
    const message = hasInvalidMonthYear(error) ? error.message : 'Failed to fetch personal expenses';
    const statusCode = hasInvalidMonthYear(error) ? 400 : 500;
    return res.status(statusCode).json({ success: false, message });
  }
};

// GET /api/personal-expenses/:id
export const getPersonalExpenseById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!mongoose.Types.ObjectId.isValid(String(id))) {
      return res.status(400).json({ success: false, message: 'Invalid expense id' });
    }

    const expense = await PersonalExpense.findById(id).lean();

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Personal expense not found' });
    }

    if (String(expense.user) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Not allowed to view this expense' });
    }

    return res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error: any) {
    console.error('Get personal expense by id error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch personal expense' });
  }
};

// GET /api/personal-expenses/summary
export const getPersonalExpensesSummary = async (req: AuthRequest, res: Response) => {
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

    const summary = await PersonalExpense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(String(userId)),
          expenseDate: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          total: { $round: ['$total', 2] },
          count: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    const grandTotal = Number(summary.reduce((acc: number, item: any) => acc + Number(item.total || 0), 0).toFixed(2));

    return res.status(200).json({
      success: true,
      data: {
        month,
        year,
        total: grandTotal,
        categories: summary,
      },
    });
  } catch (error: any) {
    console.error('Get personal expenses summary error:', error);
    const message = hasInvalidMonthYear(error) ? error.message : 'Failed to fetch summary';
    const statusCode = hasInvalidMonthYear(error) ? 400 : 500;
    return res.status(statusCode).json({ success: false, message });
  }
};

// PUT /api/personal-expenses/:id
export const updatePersonalExpense = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const expense = await PersonalExpense.findById(id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Personal expense not found' });
    }

    if (String(expense.user) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Not allowed to update this expense' });
    }

    const { description, amount, category, paymentMethod, expenseDate, isRecurring, recurringType, note, receiptUrl } = req.body || {};

    // Update description
    if (description !== undefined) {
      const nextDescription = String(description).trim();
      if (!nextDescription) {
        return res.status(400).json({ success: false, message: 'description cannot be empty' });
      }
      expense.description = nextDescription;
    }

    // Update amount
    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ success: false, message: 'amount must be a positive number' });
      }
      expense.amount = parsedAmount;
    }

    // Update category
    if (category !== undefined) {
      const nextCategory = String(category).trim();
      if (!nextCategory) {
        return res.status(400).json({ success: false, message: 'category cannot be empty' });
      }
      expense.category = nextCategory;
    }

    // Update paymentMethod
    if (paymentMethod !== undefined) {
      const nextPaymentMethod = String(paymentMethod).trim();
      if (!nextPaymentMethod) {
        return res.status(400).json({ success: false, message: 'paymentMethod cannot be empty' });
      }
      expense.paymentMethod = nextPaymentMethod;
    }

    // Update expenseDate
    if (expenseDate !== undefined) {
      const parsedDate = new Date(expenseDate);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid expenseDate' });
      }
      expense.expenseDate = parsedDate;
    }

    // Update isRecurring and recurringType
    if (isRecurring !== undefined) {
      expense.isRecurring = Boolean(isRecurring);
      if (isRecurring === true && recurringType !== undefined) {
        if (!['daily', 'monthly', 'weekly'].includes(recurringType)) {
          return res.status(400).json({ 
            success: false, 
            message: 'recurringType must be "daily", "monthly" or "weekly"' 
          });
        }
        (expense as any).recurringType = recurringType;
      } else if (isRecurring === false) {
        (expense as any).recurringType = null;
      }
    }

    // Update note
    if (note !== undefined) {
      expense.note = String(note || '').trim();
    }

    // Update receiptUrl
    if (receiptUrl !== undefined) {
      (expense as any).receiptUrl = receiptUrl ? String(receiptUrl).trim() : null;
    }

    await expense.save();

    return res.status(200).json({
      success: true,
      message: 'Personal expense updated successfully',
      data: expense,
    });
  } catch (error: any) {
    console.error('Update personal expense error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to update personal expense' });
  }
};

// DELETE /api/personal-expenses/:id
export const deletePersonalExpense = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const expense = await PersonalExpense.findById(id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Personal expense not found' });
    }

    if (String(expense.user) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Not allowed to delete this expense' });
    }

    await PersonalExpense.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Personal expense deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete personal expense error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete personal expense' });
  }
};
