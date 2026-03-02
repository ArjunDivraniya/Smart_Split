import { Response } from 'express';
import Expense from '../models/Expense.model';
import Trip from '../models/Trip.model';
import Group from '../models/Group.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendNotification } from '../utils/notification';

const toStringId = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value._id) return String(value._id);
  return String(value);
};

const getMapValue = (source: any, key: string): number => {
  if (!source) return 0;
  if (source instanceof Map) return Number(source.get(key) || 0);
  if (typeof source === 'object') return Number(source[key] || 0);
  return 0;
};

const calculateShares = (expense: any, participantIds: string[]): Record<string, number> => {
  const amount = Number(expense.amount || 0);
  const safeParticipants = participantIds.length > 0 ? participantIds : [toStringId(expense.paidBy)];
  const shares: Record<string, number> = {};

  if (expense.splitType === 'unequally') {
    let assignedTotal = 0;
    safeParticipants.forEach((id) => {
      const value = getMapValue(expense.splitAmounts, id);
      shares[id] = value;
      assignedTotal += value;
    });

    if (assignedTotal <= 0) {
      const equal = amount / safeParticipants.length;
      safeParticipants.forEach((id) => (shares[id] = equal));
    }

    return shares;
  }

  if (expense.splitType === 'percentage') {
    safeParticipants.forEach((id) => {
      const pct = getMapValue(expense.splitPercentages, id);
      shares[id] = (amount * pct) / 100;
    });
    return shares;
  }

  if (expense.splitType === 'shares') {
    let totalUnits = 0;
    safeParticipants.forEach((id) => {
      totalUnits += getMapValue(expense.splitShares, id);
    });

    if (totalUnits > 0) {
      safeParticipants.forEach((id) => {
        const units = getMapValue(expense.splitShares, id);
        shares[id] = (amount * units) / totalUnits;
      });
      return shares;
    }
  }

  const equalShare = amount / safeParticipants.length;
  safeParticipants.forEach((id) => {
    shares[id] = equalShare;
  });

  return shares;
};

const buildBalances = (expenses: any[], usersMap: Record<string, string>) => {
  const balances: Record<string, { userId: string; userName: string; netBalance: number; paid: number; owedShare: number }> = {};

  Object.entries(usersMap).forEach(([userId, userName]) => {
    balances[userId] = {
      userId,
      userName,
      netBalance: 0,
      paid: 0,
      owedShare: 0,
    };
  });

  expenses.forEach((expense: any) => {
    const payerId = toStringId(expense.paidBy);
    const paidAmount = Number(expense.amount || 0);
    const participantIds = Array.isArray(expense.splitBetween)
      ? expense.splitBetween.map((id: any) => toStringId(id)).filter(Boolean)
      : [];

    if (!participantIds.length) {
      participantIds.push(payerId);
    }

    if (!balances[payerId]) {
      balances[payerId] = {
        userId: payerId,
        userName: 'Unknown',
        netBalance: 0,
        paid: 0,
        owedShare: 0,
      };
    }

    balances[payerId].paid += paidAmount;
    balances[payerId].netBalance += paidAmount;

    const shares = calculateShares(expense, participantIds);
    participantIds.forEach((pid: string) => {
      if (!balances[pid]) {
        balances[pid] = {
          userId: pid,
          userName: 'Unknown',
          netBalance: 0,
          paid: 0,
          owedShare: 0,
        };
      }
      const shareAmount = Number(shares[pid] || 0);
      balances[pid].owedShare += shareAmount;
      balances[pid].netBalance -= shareAmount;
    });
  });

  return Object.values(balances).map((item) => ({
    ...item,
    netBalance: Number(item.netBalance.toFixed(2)),
    paid: Number(item.paid.toFixed(2)),
    owedShare: Number(item.owedShare.toFixed(2)),
  }));
};

// Add Expense (Trip legacy route)
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

    const { title, amount, category, splitBetween, splitType, splitAmounts, splitPercentages, splitShares, receiptUrl, notes } = req.body;

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
    if (receiptUrl !== undefined) expense.receiptUrl = receiptUrl;
    if (notes !== undefined) expense.notes = notes;

    await expense.save();

    if (expense.trip) {
      await sendNotification(splitBetween, userId!, expense.trip.toString(), `Updated expense "${title}" to ₹${amount}`, 'expense');
    }

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

    if (tripId) {
      await Trip.findByIdAndUpdate(tripId, {
        $pull: { expenses: id },
      });

      await sendNotification(
        expense.splitBetween.map((memberId) => memberId.toString()),
        userId!,
        tripId.toString(),
        `Deleted expense "${expenseTitle}"`,
        'expense'
      );
    }

    if (expense.group) {
      await Group.findByIdAndUpdate(expense.group, {
        $pull: { expenses: id },
      });
    }

    await Expense.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete expense error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get expenses for a group (new unified endpoint)
export const getGroupExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { paid = 'all', category, search, sortBy = 'date', sortOrder = 'desc' } = req.query;

    const group = await Group.findById(id).populate('members.userId', 'name email').lean();
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    const memberIds = new Set<string>([
      toStringId(group.createdBy),
      ...(group.members || []).map((m: any) => toStringId(m.userId)).filter(Boolean),
    ]);

    if (!userId || !memberIds.has(userId)) {
      return res.status(403).json({ success: false, error: 'Not authorized to view expenses for this group' });
    }

    const query: any = { group: id };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: String(search), $options: 'i' };
    }

    if (paid === 'you') {
      query.paidBy = userId;
    } else if (paid === 'others') {
      query.paidBy = { $ne: userId };
    }

    const sortField = sortBy === 'amount' ? 'amount' : 'date';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const expenses = await Expense.find(query)
      .populate('paidBy', 'name email')
      .populate('splitBetween', 'name email')
      .sort({ [sortField]: sortDirection })
      .lean();

    const mappedExpenses = expenses.map((expense: any) => ({
      ...expense,
      id: toStringId(expense._id),
      _id: toStringId(expense._id),
      title: expense.title,
      description: expense.title,
      paidBy: toStringId(expense.paidBy),
      paidByName: expense.paidBy?.name || 'Unknown',
      splitCount: Array.isArray(expense.splitBetween) ? expense.splitBetween.length : 0,
      splitBetween: (expense.splitBetween || []).map((member: any) => ({
        userId: toStringId(member._id || member),
        userName: member?.name || member?.email || 'Unknown',
        amount: 0,
      })),
    }));

    return res.status(200).json({
      success: true,
      data: mappedExpenses,
    });
  } catch (error: any) {
    console.error('Get group expenses error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch group expenses' });
  }
};

// Get balances for a group
export const getGroupBalances = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const group = await Group.findById(id)
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email')
      .lean();

    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    const usersMap: Record<string, string> = {};
    const creatorId = toStringId(group.createdBy);
    usersMap[creatorId] = (group.createdBy as any)?.name || 'Creator';

    (group.members || []).forEach((member: any) => {
      const memberId = toStringId(member.userId);
      if (memberId) {
        usersMap[memberId] = member.userName || member.userId?.name || member.email || 'Member';
      }
    });

    if (!userId || !Object.keys(usersMap).includes(userId)) {
      return res.status(403).json({ success: false, error: 'Not authorized to view balances for this group' });
    }

    const expenses = await Expense.find({ group: id }).lean();
    const balances = buildBalances(expenses, usersMap);

    const response = balances.map((item) => {
      const relationAmount = userId === item.userId ? 0 : Number(item.netBalance.toFixed(2));
      let relationText = 'All settled';
      let relationStatus: 'positive' | 'negative' | 'neutral' = 'neutral';

      if (relationAmount > 0) {
        relationStatus = 'positive';
        relationText = `${item.userName} owes you ₹${Math.abs(relationAmount).toFixed(2)}`;
      } else if (relationAmount < 0) {
        relationStatus = 'negative';
        relationText = `You owe ${item.userName} ₹${Math.abs(relationAmount).toFixed(2)}`;
      }

      return {
        userId: item.userId,
        user: item.userName,
        netBalance: item.netBalance,
        paid: item.paid,
        owedShare: item.owedShare,
        relationStatus,
        relationText,
      };
    });

    return res.status(200).json({ success: true, data: response });
  } catch (error: any) {
    console.error('Get group balances error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch balances' });
  }
};
