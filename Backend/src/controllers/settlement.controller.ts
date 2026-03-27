import {Response } from 'express';
import Trip from '../models/Trip.model';
import Expense from '../models/Expense.model';
import User from '../models/User.model';
import Group from '../models/Group.model';
import Settlement from '../models/Settlement.model';
import Notification from '../models/Notification.model';
import { AuthRequest } from '../middleware/auth.middleware';

const toStringId = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value._id) return String(value._id);
  return String(value);
};

const MIN_BALANCE_THRESHOLD = 0.01;

const toNumber = (value: any): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeSplitBetween = (expense: any): string[] => {
  if (!Array.isArray(expense?.splitBetween)) {
    return [];
  }

  return expense.splitBetween
    .map((participant: any) => toStringId(participant))
    .filter(Boolean);
};

const getExpenseShareForUser = (expense: any, participantId: string, participants: string[]): number => {
  const totalAmount = toNumber(expense?.amount);
  if (!participantId || totalAmount <= 0 || participants.length === 0) {
    return 0;
  }

  const splitType = String(expense?.splitType || 'equally');

  if (splitType === 'unequally') {
    const value = expense?.splitAmounts?.get?.(participantId) ?? expense?.splitAmounts?.[participantId];
    return toNumber(value);
  }

  if (splitType === 'percentage') {
    const percentage = expense?.splitPercentages?.get?.(participantId) ?? expense?.splitPercentages?.[participantId];
    return (totalAmount * toNumber(percentage)) / 100;
  }

  if (splitType === 'shares') {
    let totalShares = 0;
    const userShares = toNumber(expense?.splitShares?.get?.(participantId) ?? expense?.splitShares?.[participantId]);

    participants.forEach((id) => {
      totalShares += toNumber(expense?.splitShares?.get?.(id) ?? expense?.splitShares?.[id]);
    });

    if (totalShares > 0) {
      return (totalAmount * userShares) / totalShares;
    }
  }

  return totalAmount / participants.length;
};

const getDaysPending = (createdAt?: Date | string | null): number => {
  if (!createdAt) {
    return 0;
  }

  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) {
    return 0;
  }

  const elapsed = Date.now() - createdTime;
  return Math.max(0, Math.floor(elapsed / (1000 * 60 * 60 * 24)));
};

// Get Settlement Calculations
export const getSettlements = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const trip = await Trip.findById(id)
      .populate('members.userId', 'name email profileImage')
      .populate('createdBy', 'name email profileImage');

    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const expenses = await Expense.find({ trip: id })
      .populate('paidBy', 'name profileImage email')
      .populate('splitBetween', 'name profileImage email');

    // Initialize Direct Debts Matrix (in Paise for precision)
    const debts: Record<string, Record<string, number>> = {};
    const userDetails: Record<string, any> = {};

    const registerUser = (user: any) => {
      if (!user) return;
      const uid = user._id.toString();
      if (!debts[uid]) {
        debts[uid] = {};
        userDetails[uid] = {
          id: uid,
          name: user.name,
          avatar: user.profileImage,
          email: user.email,
        };
      }
    };

    // Register all participants
    registerUser(trip.createdBy);
    trip.members.forEach((m: any) => {
      if (m.status === 'joined') registerUser(m.userId);
    });

    // Process expenses to calculate direct debts
    expenses.forEach((expense: any) => {
      const amountPaise = Math.round(Number(expense.amount) * 100);
      const payerId = expense.paidBy._id.toString();

      registerUser(expense.paidBy);

      const beneficiaries = expense.splitBetween.map((u: any) => {
        const uid = u._id.toString();
        registerUser(u);
        return uid;
      });

      if (beneficiaries.length === 0) return;

      beneficiaries.forEach((beneficiaryId: string, index: number) => {
        if (beneficiaryId === payerId) return; // Payer doesn't owe themselves

        let sharePaise = 0;

        if (expense.splitAmounts && expense.splitAmounts.get && expense.splitAmounts.get(beneficiaryId)) {
          sharePaise = Math.round(expense.splitAmounts.get(beneficiaryId) * 100);
        } else {
          const baseShare = Math.floor(amountPaise / beneficiaries.length);
          const remainder = amountPaise % beneficiaries.length;
          sharePaise = baseShare + (index < remainder ? 1 : 0);
        }

        if (!debts[beneficiaryId]) debts[beneficiaryId] = {};
        if (!debts[beneficiaryId][payerId]) debts[beneficiaryId][payerId] = 0;

        debts[beneficiaryId][payerId] += sharePaise;
      });
    });

    // Debt Netting: If A owes B and B owes A, subtract the smaller amount
    const allUserIds = Object.keys(debts);

    for (let i = 0; i < allUserIds.length; i++) {
      for (let j = i + 1; j < allUserIds.length; j++) {
        const userA = allUserIds[i];
        const userB = allUserIds[j];

        const aOwesB = debts[userA]?.[userB] || 0;
        const bOwesA = debts[userB]?.[userA] || 0;

        if (aOwesB > 0 && bOwesA > 0) {
          const netAmount = Math.abs(aOwesB - bOwesA);
          const creditor = aOwesB > bOwesA ? userB : userA;
          const debtor = aOwesB > bOwesA ? userA : userB;

          if (debts[userA]) debts[userA][userB] = 0;
          if (debts[userB]) debts[userB][userA] = 0;

          if (!debts[debtor]) debts[debtor] = {};
          debts[debtor][creditor] = netAmount;
        }
      }
    }

    // Format Final Settlements
    const settlements: any[] = [];

    Object.entries(debts).forEach(([debtorId, creditors]) => {
      Object.entries(creditors).forEach(([creditorId, amountPaise]) => {
        if (amountPaise > 0) {
          settlements.push({
            from: userDetails[debtorId],
            to: userDetails[creditorId],
            amount: Number((amountPaise / 100).toFixed(2)),
          });
        }
      });
    });

    console.log(`✓ Direct debt settlement calculation complete for trip ${id}`);

    return res.status(200).json({
      success: true,
      data: settlements,
    });
  } catch (error: any) {
    console.error('Settlement calculation error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Record a direct settlement payment (group-scoped or cross-group)
export const recordSettlement = async (req: AuthRequest, res: Response) => {
  try {
    const fromUserId = req.userId;
    const { groupId, to, amount, method = 'cash', note } = req.body || {};

    if (!fromUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!to || !amount) {
      return res.status(400).json({ success: false, message: 'to and amount are required' });
    }

    if (String(to) === String(fromUserId)) {
      return res.status(400).json({ success: false, message: 'Cannot settle with yourself' });
    }

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'amount must be a positive number' });
    }

    const methodNormalized = String(method).toLowerCase();
    if (!['cash', 'upi', 'bank'].includes(methodNormalized)) {
      return res.status(400).json({ success: false, message: 'method must be one of cash, upi, bank' });
    }

    const toUser = await User.findById(to).select('_id name');
    if (!toUser) {
      return res.status(404).json({ success: false, message: 'Recipient user not found' });
    }

    let resolvedGroupId: string | undefined;
    if (groupId) {
      const group = await Group.findById(groupId)
        .populate('createdBy', '_id')
        .populate('members.userId', '_id')
        .lean();

      if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found' });
      }

      const memberIds = new Set<string>([
        String((group.createdBy as any)?._id || group.createdBy),
        ...((group.members || []).map((m: any) => String((m.userId as any)?._id || m.userId))),
      ]);

      if (!memberIds.has(String(fromUserId)) || !memberIds.has(String(to))) {
        return res.status(403).json({ success: false, message: 'Both users must belong to the group' });
      }

      resolvedGroupId = String(groupId);
    }

    const settlement = await Settlement.create({
      group: resolvedGroupId,
      fromUser: fromUserId,
      toUser: to,
      amount: parsedAmount,
      method: methodNormalized,
      note: note || '',
      createdBy: fromUserId,
      status: 'completed',
    });

    const fromUser = await User.findById(fromUserId).select('_id name');

    await Notification.create({
      recipient: to,
      sender: fromUserId,
      message: `${fromUser?.name || 'Someone'} recorded a settlement of ₹${parsedAmount.toFixed(2)} via ${methodNormalized.toUpperCase()}`,
      type: 'expense',
    });

    const populatedSettlement = await Settlement.findById(settlement._id)
      .populate('fromUser', '_id name email profileImage')
      .populate('toUser', '_id name email profileImage')
      .populate('group', '_id name')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Settlement recorded successfully',
      data: populatedSettlement,
    });
  } catch (error: any) {
    console.error('Record settlement error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to record settlement' });
  }
};

// Get settlement history for a specific group
export const getGroupSettlementHistory = async (req: AuthRequest, res: Response) => {
  try {
    const requesterId = req.userId;
    const { groupId } = req.params;

    if (!requesterId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!groupId) {
      return res.status(400).json({ success: false, message: 'groupId is required' });
    }

    const group = await Group.findById(groupId)
      .populate('createdBy', '_id')
      .populate('members.userId', '_id')
      .lean();

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const memberIds = new Set<string>([
      toStringId(group.createdBy),
      ...((group.members || []).map((m: any) => toStringId(m.userId))),
    ]);

    if (!memberIds.has(String(requesterId))) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this group settlements' });
    }

    const settlements = await Settlement.find({ group: groupId, status: 'completed' })
      .populate('fromUser', '_id name email profileImage')
      .populate('toUser', '_id name email profileImage')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: settlements,
    });
  } catch (error: any) {
    console.error('Get group settlements history error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch group settlements' });
  }
};

// Get all settlements involving current user across all groups
export const getUserSettlements = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const settlements = await Settlement.find({
      $or: [{ fromUser: userId }, { toUser: userId }],
    })
      .populate('fromUser', '_id name email profileImage')
      .populate('toUser', '_id name email profileImage')
      .populate('group', '_id name type emoji')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: settlements,
    });
  } catch (error: any) {
    console.error('Get user settlements error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch user settlements' });
  }
};

// Get pending settlements for current user across all groups
export const getPendingSettlements = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const statusFilter = String(req.query.status || '').trim().toLowerCase();
    const directionFilter = String(req.query.direction || '').trim().toLowerCase();
    const groupIdFilter = String(req.query.groupId || '').trim();

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const allowedStatus = new Set(['pending', 'overdue', 'partial', 'completed']);
    const allowedDirections = new Set(['you_owe', 'they_owe']);

    if (statusFilter && !allowedStatus.has(statusFilter)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status filter. Use pending, overdue, partial, or completed.',
      });
    }

    if (directionFilter && !allowedDirections.has(directionFilter)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid direction filter. Use you_owe or they_owe.',
      });
    }

    const groupQuery: Record<string, any> = {
      $or: [{ createdBy: userId }, { 'members.userId': userId }],
    };

    if (groupIdFilter) {
      groupQuery._id = groupIdFilter;
    }

    const groups = await Group.find(groupQuery)
      .select('_id name emoji type createdBy members')
      .lean();

    const groupById = new Map<string, any>();
    groups.forEach((group: any) => {
      groupById.set(toStringId(group._id), group);
    });

    const pendingItemsRaw: any[] = [];

    for (const group of groups) {
      const groupId = toStringId(group._id);

      const expenses = await Expense.find({ group: groupId })
        .select('_id title amount splitBetween splitType splitAmounts splitPercentages splitShares paidBy createdAt date')
        .lean();

      const balanceMap = new Map<string, number>();
      const expenseMetaByFriend = new Map<string, { expenseDescription: string; createdAt: Date | null }>();

      const accumulateBalance = (friendId: string, delta: number, expense: any) => {
        if (!friendId || friendId === String(userId)) {
          return;
        }

        const nextValue = toNumber(balanceMap.get(friendId) || 0) + delta;
        balanceMap.set(friendId, Number(nextValue.toFixed(2)));

        if (expense) {
          const currentMeta = expenseMetaByFriend.get(friendId);
          const createdAt = expense.createdAt || expense.date || null;

          if (!currentMeta || (createdAt && new Date(createdAt).getTime() > new Date(currentMeta.createdAt || 0).getTime())) {
            expenseMetaByFriend.set(friendId, {
              expenseDescription: expense.title || 'Shared expense',
              createdAt: createdAt ? new Date(createdAt) : null,
            });
          }
        }
      };

      expenses.forEach((expense: any) => {
        const payerId = toStringId(expense.paidBy);
        const participants = normalizeSplitBetween(expense);

        if (!participants.length && payerId) {
          participants.push(payerId);
        }

        const userIsPayer = payerId === String(userId);
        const userInSplit = participants.includes(String(userId));

        if (!userIsPayer && !userInSplit) {
          return;
        }

        if (userIsPayer) {
          participants.forEach((participantId) => {
            if (participantId === String(userId)) {
              return;
            }

            const share = getExpenseShareForUser(expense, participantId, participants);
            if (share > 0) {
              accumulateBalance(participantId, share, expense);
            }
          });
          return;
        }

        if (userInSplit && payerId) {
          const myShare = getExpenseShareForUser(expense, String(userId), participants);
          if (myShare > 0) {
            accumulateBalance(payerId, -myShare, expense);
          }
        }
      });

      const completedSettlements = await Settlement.find({
        group: groupId,
        status: 'completed',
        $and: [
          { $or: [{ fromUser: userId }, { toUser: userId }] },
          { $or: [{ type: { $ne: 'partial' } }, { remaining: { $lte: MIN_BALANCE_THRESHOLD } }] },
        ],
      })
        .select('_id fromUser toUser amount createdAt')
        .lean();

      completedSettlements.forEach((settlement: any) => {
        const fromUserId = toStringId(settlement.fromUser);
        const toUserId = toStringId(settlement.toUser);
        const settledAmount = toNumber(settlement.amount);

        if (settledAmount <= 0) {
          return;
        }

        if (fromUserId === String(userId) && toUserId) {
          const current = toNumber(balanceMap.get(toUserId) || 0);
          balanceMap.set(toUserId, Number((current + settledAmount).toFixed(2)));
        } else if (toUserId === String(userId) && fromUserId) {
          const current = toNumber(balanceMap.get(fromUserId) || 0);
          balanceMap.set(fromUserId, Number((current - settledAmount).toFixed(2)));
        }
      });

      const partialSettlements = await Settlement.find({
        group: groupId,
        $and: [
          { $or: [{ fromUser: userId }, { toUser: userId }] },
          { $or: [{ status: 'partial' as any }, { type: 'partial', remaining: { $gt: 0 } }] },
        ],
      })
        .select('_id fromUser toUser amount amountPaid remaining dueDate remindedAt remindCount source createdAt note')
        .lean();

      const partialByFriend = new Map<string, any>();

      partialSettlements.forEach((settlement: any) => {
        const fromUserId = toStringId(settlement.fromUser);
        const toUserId = toStringId(settlement.toUser);
        const paidAmount = toNumber(settlement.amountPaid);

        if (fromUserId === String(userId) && toUserId) {
          const current = toNumber(balanceMap.get(toUserId) || 0);
          balanceMap.set(toUserId, Number((current + paidAmount).toFixed(2)));

          const prev = partialByFriend.get(toUserId);
          if (!prev || new Date(settlement.createdAt).getTime() >= new Date(prev.createdAt).getTime()) {
            partialByFriend.set(toUserId, settlement);
          }
        } else if (toUserId === String(userId) && fromUserId) {
          const current = toNumber(balanceMap.get(fromUserId) || 0);
          balanceMap.set(fromUserId, Number((current - paidAmount).toFixed(2)));

          const prev = partialByFriend.get(fromUserId);
          if (!prev || new Date(settlement.createdAt).getTime() >= new Date(prev.createdAt).getTime()) {
            partialByFriend.set(fromUserId, settlement);
          }
        }
      });

      Array.from(balanceMap.entries()).forEach(([friendId, netBalance]) => {
        if (Math.abs(netBalance) <= MIN_BALANCE_THRESHOLD) {
          return;
        }

        const partial = partialByFriend.get(friendId);
        const direction = netBalance < 0 ? 'you_owe' : 'they_owe';
        const amount = Number(Math.abs(netBalance).toFixed(2));
        const amountPaid = partial ? toNumber(partial.amountPaid) : 0;
        const remaining = partial
          ? Math.max(0, toNumber(partial.remaining || partial.amount - partial.amountPaid))
          : amount;

        const expenseMeta = expenseMetaByFriend.get(friendId);
        const createdAt = partial?.createdAt || expenseMeta?.createdAt || new Date();
        const dueDate = partial?.dueDate ? new Date(partial.dueDate) : null;
        const daysPending = getDaysPending(createdAt);
        const overdueByDueDate = Boolean(dueDate && dueDate.getTime() < Date.now());
        const overdueByAge = daysPending > 7 && amountPaid <= 0;
        const isOverdue = overdueByDueDate || overdueByAge;

        const status = partial ? 'partial' : isOverdue ? 'overdue' : 'pending';

        pendingItemsRaw.push({
          id: toStringId(partial?._id) || `${groupId}-${String(userId)}-${friendId}`,
          friendId,
          amount,
          amountPaid,
          remaining,
          direction,
          status,
          source: partial?.source || 'group',
          group: {
            id: groupId,
            name: group.name || 'Group',
            emoji: group.emoji || '👥',
            type: group.type || 'custom',
          },
          expenseDescription: partial?.note || expenseMeta?.expenseDescription || 'Shared expense',
          createdAt,
          daysPending,
          remindCount: toNumber(partial?.remindCount),
          remindedAt: partial?.remindedAt || null,
          dueDate,
        });
      });
    }

    let settlements = pendingItemsRaw;

    if (statusFilter === 'completed') {
      const completedQuery: Record<string, any> = {
        status: 'completed',
        $or: [{ fromUser: userId }, { toUser: userId }],
        $and: [{ $or: [{ type: { $ne: 'partial' } }, { remaining: { $lte: MIN_BALANCE_THRESHOLD } }] }],
      };

      if (groupIdFilter) {
        completedQuery.group = groupIdFilter;
      }

      const completedSettlements = await Settlement.find(completedQuery)
        .select('_id fromUser toUser amount source group note createdAt remindCount remindedAt dueDate')
        .populate('group', '_id name emoji type')
        .lean();

      settlements = completedSettlements.map((item: any) => {
        const fromUserId = toStringId(item.fromUser);
        const toUserId = toStringId(item.toUser);
        const friendId = fromUserId === String(userId) ? toUserId : fromUserId;
        const direction = fromUserId === String(userId) ? 'you_owe' : 'they_owe';
        const createdAt = item.createdAt || new Date();

        return {
          id: toStringId(item._id),
          friendId,
          amount: toNumber(item.amount),
          amountPaid: toNumber(item.amount),
          remaining: 0,
          direction,
          status: 'completed',
          source: item.source || 'group',
          group: {
            id: toStringId(item.group?._id || item.group),
            name: item.group?.name || groupById.get(toStringId(item.group))?.name || 'Group',
            emoji: item.group?.emoji || groupById.get(toStringId(item.group))?.emoji || '👥',
            type: item.group?.type || groupById.get(toStringId(item.group))?.type || 'custom',
          },
          expenseDescription: item.note || 'Settlement completed',
          createdAt,
          daysPending: getDaysPending(createdAt),
          remindCount: toNumber(item.remindCount),
          remindedAt: item.remindedAt || null,
          dueDate: item.dueDate || null,
        };
      });
    }

    const friendIds = Array.from(new Set(settlements.map((item) => item.friendId).filter(Boolean)));
    const friends = await User.find({ _id: { $in: friendIds } })
      .select('_id name avatar profileImage phone upiId')
      .lean();

    const friendMap = new Map<string, any>();
    friends.forEach((friend: any) => {
      const friendId = toStringId(friend._id);
      friendMap.set(friendId, {
        id: friendId,
        name: friend.name || 'Unknown',
        avatar: friend.avatar || friend.profileImage || '',
        phone: friend.phone || '',
        upiId: friend.upiId || '',
      });
    });

    settlements = settlements
      .map((item) => ({
        ...item,
        friend:
          friendMap.get(item.friendId) || {
            id: item.friendId,
            name: 'Unknown',
            avatar: '',
            phone: '',
            upiId: '',
          },
      }))
      .map(({ friendId, ...rest }) => rest);

    if (statusFilter && statusFilter !== 'completed') {
      settlements = settlements.filter((item) => item.status === statusFilter);
    }

    if (directionFilter) {
      settlements = settlements.filter((item) => item.direction === directionFilter);
    }

    const summary = settlements.reduce(
      (acc, item) => {
        const remainingAmount = toNumber(item.remaining ?? item.amount);

        if (item.direction === 'you_owe') {
          acc.totalYouOwe += remainingAmount;
        } else if (item.direction === 'they_owe') {
          acc.totalYouGet += remainingAmount;
        }

        if (item.status !== 'completed') {
          acc.pendingCount += 1;
        }

        if (item.status === 'overdue' || toNumber(item.daysPending) > 7) {
          acc.overdueCount += 1;
        }

        if (item.status === 'partial') {
          acc.partialCount += 1;
        }

        return acc;
      },
      {
        totalYouOwe: 0,
        totalYouGet: 0,
        netBalance: 0,
        pendingCount: 0,
        overdueCount: 0,
        partialCount: 0,
      }
    );

    summary.totalYouOwe = Number(summary.totalYouOwe.toFixed(2));
    summary.totalYouGet = Number(summary.totalYouGet.toFixed(2));
    summary.netBalance = Number((summary.totalYouGet - summary.totalYouOwe).toFixed(2));

    return res.status(200).json({
      success: true,
      data: {
        summary,
        settlements,
      },
    });
  } catch (error: any) {
    console.error('Get pending settlements error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch pending settlements',
    });
  }
};

// Get settlement history with pagination and filtering
export const getSettlementHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const friendIdFilter = String(req.query.friendId || '').trim();
    const groupIdFilter = String(req.query.groupId || '').trim();
    const monthFilter = String(req.query.month || '').trim();
    const yearFilter = String(req.query.year || '').trim();

    const query: Record<string, any> = {
      status: 'completed',
      $or: [{ fromUser: userId }, { toUser: userId }],
    };

    if (friendIdFilter) {
      query.$or = [
        { fromUser: userId, toUser: friendIdFilter },
        { fromUser: friendIdFilter, toUser: userId },
      ];
    }

    if (groupIdFilter) {
      query.group = groupIdFilter;
    }

    if (monthFilter && yearFilter) {
      const month = Number(monthFilter);
      const year = Number(yearFilter);

      if (month >= 1 && month <= 12 && year > 2000) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);

        query.createdAt = {
          $gte: startDate,
          $lt: endDate,
        };
      }
    }

    const skip = (page - 1) * limit;

    const [settlements, total] = await Promise.all([
      Settlement.find(query)
        .populate('fromUser', '_id name avatar profileImage email')
        .populate('toUser', '_id name avatar profileImage email')
        .populate('group', '_id name emoji type')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Settlement.countDocuments(query),
    ]);

    const hasMore = skip + limit < total;

    return res.status(200).json({
      success: true,
      data: {
        settlements,
        pagination: {
          page,
          limit,
          total,
          hasMore,
        },
      },
    });
  } catch (error: any) {
    console.error('Get settlement history error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch settlement history',
    });
  }
};

// Record a partial payment for an existing settlement
export const recordPartialSettlementPayment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const settlementId = req.params.id;
    const { amountPaid, method, note } = req.body || {};

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const settlement = await Settlement.findById(settlementId);
    if (!settlement) {
      return res.status(404).json({ success: false, message: 'Settlement not found' });
    }

    if (toStringId(settlement.fromUser) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Only payer can record partial payment' });
    }

    const parsedPaidAmount = Number(amountPaid);
    if (!Number.isFinite(parsedPaidAmount) || parsedPaidAmount <= 0) {
      return res.status(400).json({ success: false, message: 'amountPaid must be a positive number' });
    }

    const currentRemaining = Number(
      (Number(settlement.remaining) > 0
        ? Number(settlement.remaining)
        : Number(settlement.amount || 0) - Number(settlement.amountPaid || 0)
      ).toFixed(2)
    );

    if (parsedPaidAmount > currentRemaining) {
      return res.status(400).json({
        success: false,
        message: `Amount exceeds remaining balance of ₹${currentRemaining.toFixed(2)}`,
      });
    }

    if (method !== undefined) {
      const methodNormalized = String(method).toLowerCase();
      if (!['cash', 'upi', 'bank'].includes(methodNormalized)) {
        return res.status(400).json({ success: false, message: 'method must be one of cash, upi, bank' });
      }
      settlement.method = methodNormalized as 'cash' | 'upi' | 'bank';
    }

    if (note !== undefined) {
      settlement.note = String(note || '');
    }

    const nextAmountPaid = Number((Number(settlement.amountPaid || 0) + parsedPaidAmount).toFixed(2));
    settlement.amountPaid = nextAmountPaid;
    settlement.type = nextAmountPaid < Number(settlement.amount || 0) ? 'partial' : 'full';

    await settlement.save();

    const isCompleted = Number(settlement.remaining || 0) <= 0;
    await Notification.create({
      recipient: settlement.toUser,
      sender: settlement.fromUser,
      message: isCompleted
        ? 'Payment received in full ✅'
        : `Partial payment of ₹${parsedPaidAmount.toFixed(2)} received. ₹${Number(settlement.remaining || 0).toFixed(2)} still remaining`,
      type: isCompleted ? 'settled' : 'expense_added',
    });

    const updatedSettlement = await Settlement.findById(settlement._id)
      .populate('fromUser', '_id name avatar profileImage email')
      .populate('toUser', '_id name avatar profileImage email')
      .lean();

    return res.status(200).json({
      success: true,
      message: isCompleted ? 'Settlement completed successfully' : 'Partial payment recorded successfully',
      data: updatedSettlement,
    });
  } catch (error: any) {
    console.error('Record partial settlement payment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to record partial settlement payment',
    });
  }
};

// Send a reminder for pending settlement via WhatsApp URL
export const sendSettlementReminder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const settlementId = String(req.body?.settlementId || '').trim();

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!settlementId) {
      return res.status(400).json({ success: false, message: 'settlementId is required' });
    }

    const settlement = await Settlement.findById(settlementId)
      .populate('fromUser', '_id name phone')
      .populate('toUser', '_id name')
      .populate('group', '_id name');

    if (!settlement) {
      return res.status(404).json({ success: false, message: 'Settlement not found' });
    }

    if (toStringId(settlement.toUser) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Only receiver can send reminders' });
    }

    const now = new Date();
    const cooldownMs = 24 * 60 * 60 * 1000;

    if (settlement.remindedAt) {
      const lastRemindedAt = new Date(settlement.remindedAt);
      const canRemindAgainAt = new Date(lastRemindedAt.getTime() + cooldownMs);

      if (now.getTime() < canRemindAgainAt.getTime()) {
        return res.status(429).json({
          success: false,
          message: 'Please wait 24 hours between reminders',
          canRemindAgainAt: canRemindAgainAt.toISOString(),
        });
      }
    }

    settlement.remindCount = Number(settlement.remindCount || 0) + 1;
    settlement.remindedAt = now;
    await settlement.save();

    const fromUser = settlement.fromUser as any;
    const group = settlement.group as any;

    const phone = String(fromUser?.phone || '').replace(/\D/g, '');
    const friendName = fromUser?.name || 'friend';
    const groupName = group?.name || 'your group';
    const amount = Number(settlement.remaining > 0 ? settlement.remaining : settlement.amount).toFixed(2);
    const daysPending = getDaysPending(settlement.createdAt);

    const message = `Hey ${friendName}! Just a reminder — you owe me ₹${amount} from ${groupName}. It's been ${daysPending} days. Please settle when you can 🙏`;
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
    const canRemindAgainAt = new Date(now.getTime() + cooldownMs).toISOString();

    return res.status(200).json({
      success: true,
      message,
      whatsappUrl,
      remindCount: settlement.remindCount,
      canRemindAgainAt,
    });
  } catch (error: any) {
    console.error('Send settlement reminder error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send settlement reminder',
    });
  }
};

// Mark settlement as fully received by receiver
export const markSettlementAsReceived = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const settlementId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const settlement = await Settlement.findById(settlementId);
    if (!settlement) {
      return res.status(404).json({ success: false, message: 'Settlement not found' });
    }

    if (toStringId(settlement.toUser) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Only receiver can confirm payment received' });
    }

    settlement.amountPaid = Number(settlement.amount || 0);
    settlement.type = 'full';
    await settlement.save();

    await Notification.create({
      recipient: settlement.fromUser,
      sender: settlement.toUser,
      message: `Your payment of ₹${Number(settlement.amount || 0).toFixed(2)} was confirmed received ✅`,
      type: 'settled',
    });

    const updatedSettlement = await Settlement.findById(settlement._id)
      .populate('fromUser', '_id name avatar profileImage email')
      .populate('toUser', '_id name avatar profileImage email')
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Settlement marked as received',
      data: updatedSettlement,
    });
  } catch (error: any) {
    console.error('Mark settlement as received error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark settlement as received',
    });
  }
};
