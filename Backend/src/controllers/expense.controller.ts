import { Response } from 'express';
import Expense from '../models/Expense.model';
import Trip from '../models/Trip.model';
import Group from '../models/Group.model';
import Settlement from '../models/Settlement.model';
import User from '../models/User.model';
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

const applyCompletedSettlementsToBalances = (
  balances: Array<{ userId: string; userName: string; netBalance: number; paid: number; owedShare: number }>,
  settlements: any[]
) => {
  const balancesByUser = new Map(
    balances.map((row) => [
      row.userId,
      {
        ...row,
        netBalance: Number(row.netBalance || 0),
      },
    ])
  );

  (settlements || []).forEach((settlement: any) => {
    const fromUserId = toStringId(settlement.fromUser);
    const toUserId = toStringId(settlement.toUser);
    const amount = Number(settlement.amount || 0);

    if (!fromUserId || !toUserId || Number.isNaN(amount) || amount <= 0) {
      return;
    }

    const fromRow = balancesByUser.get(fromUserId);
    const toRow = balancesByUser.get(toUserId);

    if (fromRow) {
      fromRow.netBalance = Number((fromRow.netBalance + amount).toFixed(2));
      balancesByUser.set(fromUserId, fromRow);
    }

    if (toRow) {
      toRow.netBalance = Number((toRow.netBalance - amount).toFixed(2));
      balancesByUser.set(toUserId, toRow);
    }
  });

  return Array.from(balancesByUser.values()).map((row) => ({
    ...row,
    netBalance: Number(row.netBalance.toFixed(2)),
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

    const [actor, trip] = await Promise.all([
      User.findById(userId).select('name').lean(),
      Trip.findById(tripId).select('name').lean(),
    ]);

    const actorName = String(actor?.name || 'Someone').trim();
    const amountText = Number(amount || 0).toLocaleString('en-IN');
    const groupName = String(trip?.name || 'Group').trim();
    const expenseDescription = String(title || 'Expense').trim();

    await sendNotification(
      splitBetween,
      userId!,
      tripId,
      `${actorName} added ${expenseDescription} ₹${amountText} in ${groupName}`,
      'expense_added'
    );

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

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const isPaidByUser = expense.paidBy.toString() === userId;
    let isGroupCreator = false;

    if (!isPaidByUser && expense.group) {
      const group = await Group.findById(expense.group).select('createdBy').lean();
      isGroupCreator = Boolean(group?.createdBy && group.createdBy.toString() === userId);
    }

    if (!isPaidByUser && !isGroupCreator) {
      return res.status(403).json({ message: 'Only the payer or group creator can edit this expense' });
    }

    const {
      amount,
      description,
      title,
      category,
      splitType,
      splitBetween,
      date,
      notes,
      receiptImage,
      receiptUrl,
      splitAmounts,
      splitPercentages,
      splitShares,
    } = req.body || {};

    const nextTitleRaw = description !== undefined ? description : title;
    if (nextTitleRaw !== undefined) {
      const nextTitle = String(nextTitleRaw).trim();
      if (!nextTitle) {
        return res.status(400).json({ message: 'Description cannot be empty' });
      }
      expense.title = nextTitle;
    }

    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number' });
      }
      expense.amount = parsedAmount;
    }

    if (category !== undefined) {
      expense.category = category;
    }

    if (splitType !== undefined) {
      const allowedSplitTypes = ['equally', 'unequally', 'percentage', 'shares'];
      if (!allowedSplitTypes.includes(splitType)) {
        return res.status(400).json({ message: 'Invalid splitType value' });
      }
      expense.splitType = splitType;
    }

    if (splitBetween !== undefined) {
      if (!Array.isArray(splitBetween) || splitBetween.length === 0) {
        return res.status(400).json({ message: 'splitBetween must contain at least one member' });
      }
      expense.splitBetween = splitBetween;
    }

    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date value' });
      }
      expense.date = parsedDate;
    }

    if (splitAmounts) expense.splitAmounts = splitAmounts;
    if (splitPercentages) expense.splitPercentages = splitPercentages;
    if (splitShares) expense.splitShares = splitShares;
    const resolvedReceipt = receiptImage !== undefined ? receiptImage : receiptUrl;
    if (resolvedReceipt !== undefined) expense.receiptUrl = resolvedReceipt;
    if (notes !== undefined) expense.notes = notes;

    await expense.save();

    if (expense.trip || expense.group) {
      const notifyTargets = Array.isArray(expense.splitBetween)
        ? expense.splitBetween.map((memberId: any) => memberId.toString())
        : [];
      const parentId = (expense.trip || expense.group)?.toString() || '';
      if (!parentId) return; // Should not happen given the if check

      const isTrip = !!expense.trip;
      await sendNotification(
        notifyTargets,
        userId,
        parentId,
        `Updated expense "${expense.title}" to ₹${Number(expense.amount).toFixed(2)}`,
        'expense',
        isTrip
      );
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

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const isPaidByUser = expense.paidBy.toString() === userId;
    let isGroupCreator = false;

    if (!isPaidByUser && expense.group) {
      const group = await Group.findById(expense.group).select('createdBy').lean();
      isGroupCreator = Boolean(group?.createdBy && group.createdBy.toString() === userId);
    }

    if (!isPaidByUser && !isGroupCreator) {
      return res.status(403).json({ message: 'Only the payer or group creator can delete this expense' });
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

      await sendNotification(
        expense.splitBetween.map((memberId) => memberId.toString()),
        userId!,
        expense.group.toString(),
        `Deleted expense "${expenseTitle}"`,
        'expense',
        false
      );
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
    const settlementHistory = await Settlement.find({ group: id, status: 'completed' })
      .select('fromUser toUser amount')
      .lean();

    const rawBalances = buildBalances(expenses, usersMap);
    const balances = applyCompletedSettlementsToBalances(rawBalances, settlementHistory);

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
