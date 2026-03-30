import { Router } from 'express';
import mongoose from 'mongoose';
import Budget from '../models/Budget.model';
import PersonalExpense from '../models/PersonalExpense.model';
import Notification from '../models/Notification.model';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

// POST /api/budgets
// Create or update a budget for category+month+year.
router.post('/', async (req: any, res) => {
  try {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { category, monthlyLimit, month, year } = req.body || {};
    const normalizedCategory = String(category || '').trim();
    const parsedLimit = Number(monthlyLimit);
    const parsedMonth = Number(month);
    const parsedYear = Number(year);

    if (!normalizedCategory || !Number.isInteger(parsedMonth) || !Number.isInteger(parsedYear)) {
      return res.status(400).json({ success: false, message: 'category, monthlyLimit, month, year are required' });
    }

    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({ success: false, message: 'monthlyLimit must be > 0' });
    }

    const savedBudget = await Budget.findOneAndUpdate(
      {
        user: userId,
        category: normalizedCategory,
        month: parsedMonth,
        year: parsedYear,
      },
      {
        $set: {
          user: userId,
          category: normalizedCategory,
          limit: parsedLimit,
          month: parsedMonth,
          year: parsedYear,
          alertSent: false,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json(savedBudget);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/budgets/status
// Return budgets with spent/remaining/percentage/status for a month.
router.get('/status', async (req: any, res) => {
  try {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const now = new Date();
    const month = Number(req.query.month || now.getMonth() + 1);
    const year = Number(req.query.year || now.getFullYear());

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return res.status(400).json({ success: false, message: 'Invalid month' });
    }

    if (!Number.isInteger(year) || year < 2000 || year > 3000) {
      return res.status(400).json({ success: false, message: 'Invalid year' });
    }

    const budgets = await Budget.find({ user: userId, month, year });

    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 1, 0, 0, 0, 0);

    const spendingByCategory = await PersonalExpense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(String(userId)),
          expenseDate: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          spent: { $sum: '$amount' },
        },
      },
    ]);

    const spentMap = new Map<string, number>();
    spendingByCategory.forEach((row: any) => {
      spentMap.set(String(row._id), Number(row.spent || 0));
    });

    const budgetsWithStatus = await Promise.all(
      budgets.map(async (budget: any) => {
        const monthlyLimit = Number(budget.limit || 0);
        const spent = Number(spentMap.get(String(budget.category)) || 0);
        const remaining = monthlyLimit - spent;
        const percentage = monthlyLimit > 0 ? Math.round((spent / monthlyLimit) * 100) : 0;

        let status: 'safe' | 'warning' | 'danger' | 'over' = 'safe';
        if (percentage >= 100) {
          status = 'over';
        } else if (percentage >= 80) {
          status = 'danger';
        } else if (percentage >= 60) {
          status = 'warning';
        }

        if (percentage >= 80 && !budget.alertSent) {
          await Notification.create({
            recipient: userId,
            type: 'budget_alert',
            message: `Budget alert: ${budget.category} has reached ${percentage}% of your monthly limit.`,
          });

          budget.alertSent = true;
          await budget.save();
        }

        return {
          _id: String(budget._id),
          category: String(budget.category),
          monthlyLimit,
          limit: monthlyLimit,
          month: Number(budget.month),
          year: Number(budget.year),
          alertSent: Boolean(budget.alertSent),
          spent,
          remaining,
          percentage,
          status,
        };
      })
    );

    const totalBudget = budgetsWithStatus.reduce((sum, b) => sum + Number(b.monthlyLimit || 0), 0);
    const totalSpent = budgetsWithStatus.reduce((sum, b) => sum + Number(b.spent || 0), 0);
    const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: budgetsWithStatus,
      budgets: budgetsWithStatus,
      month,
      year,
      totalBudget,
      totalSpent,
      overallPercentage,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/budgets/:id
// Update monthly limit and reset alertSent.
router.put('/:id', async (req: any, res) => {
  try {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    
    // Safety check for Expo Router serializing undefined as 'undefined'
    if (!id || id === 'undefined' || id === 'null' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid budget reference ID' });
    }

    const { monthlyLimit, limit } = req.body || {};
    const parsedLimit = Number(monthlyLimit ?? limit);

    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({ success: false, message: 'limit must be a positive number' });
    }

    const budget = await Budget.findById(id);
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    if (String(budget.user) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updatedBudget = await Budget.findByIdAndUpdate(
      id,
      { $set: { limit: parsedLimit, alertSent: false } },
      { new: true, runValidators: true }
    );

    return res.status(200).json(updatedBudget);
  } catch (err: any) {
    console.error('Update Budget Error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', async (req: any, res) => {
  try {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const budget = await Budget.findById(id);

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    if (String(budget.user) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Budget.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Budget removed' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/budgets/copy
router.post('/copy', async (req: any, res) => {
  try {
    const userId = req.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { targetMonth, targetYear } = req.body || {};
    if (!targetMonth || !targetYear) {
      return res.status(400).json({ success: false, message: 'targetMonth and targetYear required' });
    }

    const month = Number(targetMonth);
    const year = Number(targetYear);
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    const prevBudgets = await Budget.find({ user: userId, month: prevMonth, year: prevYear });
    
    if (!prevBudgets || prevBudgets.length === 0) {
      return res.status(404).json({ success: false, message: 'No budgets found in previous month' });
    }

    let newCount = 0;
    for (const pb of prevBudgets) {
      const existing = await Budget.findOne({ user: userId, category: pb.category, month, year });
      if (!existing) {
        await Budget.create({
          user: userId,
          category: pb.category,
          limit: pb.limit,
          month,
          year,
          alertSent: false,
        });
        newCount++;
      }
    }

    return res.status(200).json({ success: true, message: `Copied ${newCount} budgets` });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
