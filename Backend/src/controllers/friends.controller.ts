import mongoose from 'mongoose';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Group from '../models/Group.model';
import Expense from '../models/Expense.model';
import Settlement from '../models/Settlement.model';
import User from '../models/User.model';

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
      safeParticipants.forEach((id) => {
        shares[id] = equal;
      });
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

const getUserGroupIds = async (userId: string): Promise<string[]> => {
  const groups = await Group.find({
    $or: [{ createdBy: userId }, { 'members.userId': userId }],
  })
    .select('_id')
    .lean();

  return groups.map((group: any) => toStringId(group._id)).filter(Boolean);
};

// GET /api/friends/balances
export const getFriendBalances = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const groupIds = await getUserGroupIds(String(userId));
    if (!groupIds.length) {
      return res.status(200).json({ success: true, data: [] });
    }

    const expenses = await Expense.find({ group: { $in: groupIds } }).lean();

    const netByFriend = new Map<string, number>();

    expenses.forEach((expense: any) => {
      const payerId = toStringId(expense.paidBy);
      const participantIds = Array.isArray(expense.splitBetween)
        ? expense.splitBetween.map((id: any) => toStringId(id)).filter(Boolean)
        : [];

      if (!participantIds.length) {
        participantIds.push(payerId);
      }

      const shares = calculateShares(expense, participantIds);

      if (payerId === userId) {
        participantIds.forEach((pid: string) => {
          if (pid === userId) return;
          const existing = Number(netByFriend.get(pid) || 0);
          netByFriend.set(pid, Number((existing + Number(shares[pid] || 0)).toFixed(2)));
        });
      } else if (participantIds.includes(String(userId))) {
        const existing = Number(netByFriend.get(payerId) || 0);
        netByFriend.set(payerId, Number((existing - Number(shares[String(userId)] || 0)).toFixed(2)));
      }
    });

    const settlements = await Settlement.find({
      status: 'completed',
      $or: [{ fromUser: userId }, { toUser: userId }],
    })
      .select('fromUser toUser amount')
      .lean();

    settlements.forEach((settlement: any) => {
      const fromUserId = toStringId(settlement.fromUser);
      const toUserId = toStringId(settlement.toUser);
      const amount = Number(settlement.amount || 0);

      if (!amount || Number.isNaN(amount)) {
        return;
      }

      if (fromUserId === userId && toUserId !== userId) {
        const existing = Number(netByFriend.get(toUserId) || 0);
        netByFriend.set(toUserId, Number((existing + amount).toFixed(2)));
      }

      if (toUserId === userId && fromUserId !== userId) {
        const existing = Number(netByFriend.get(fromUserId) || 0);
        netByFriend.set(fromUserId, Number((existing - amount).toFixed(2)));
      }
    });

    const friendIds = Array.from(netByFriend.keys()).filter((id) => id && Math.abs(Number(netByFriend.get(id) || 0)) > 0.005);
    if (!friendIds.length) {
      return res.status(200).json({ success: true, data: [] });
    }

    const friends = await User.find({ _id: { $in: friendIds } })
      .select('_id name')
      .lean();

    const nameById = new Map<string, string>();
    friends.forEach((friend: any) => {
      nameById.set(toStringId(friend._id), String(friend.name || 'Unknown'));
    });

    const data = friendIds
      .map((friendId) => ({
        friendId,
        name: nameById.get(friendId) || 'Unknown',
        netBalance: Number((netByFriend.get(friendId) || 0).toFixed(2)),
      }))
      .sort((a, b) => Math.abs(b.netBalance) - Math.abs(a.netBalance));

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Get friend balances error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch friend balances' });
  }
};

// GET /api/friends/:id/history
export const getFriendHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const friendId = String(req.params.id || '');

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!mongoose.Types.ObjectId.isValid(friendId)) {
      return res.status(400).json({ success: false, message: 'Invalid friend id' });
    }

    const sharedGroups = await Group.find({
      $and: [
        { $or: [{ createdBy: userId }, { 'members.userId': userId }] },
        { $or: [{ createdBy: friendId }, { 'members.userId': friendId }] },
      ],
    })
      .select('_id')
      .lean();

    const sharedGroupIds = sharedGroups.map((group: any) => group._id);

    const expenses = sharedGroupIds.length
      ? await Expense.find({ group: { $in: sharedGroupIds } })
          .select('title amount category date paidBy splitBetween splitType splitAmounts splitPercentages splitShares')
          .lean()
      : [];

    const expenseHistory = expenses
      .map((expense: any) => {
        const payerId = toStringId(expense.paidBy);
        const participantIds = Array.isArray(expense.splitBetween)
          ? expense.splitBetween.map((id: any) => toStringId(id)).filter(Boolean)
          : [];

        if (!participantIds.length) {
          participantIds.push(payerId);
        }

        const shares = calculateShares(expense, participantIds);

        if (payerId === userId && participantIds.includes(friendId)) {
          return {
            type: 'expense',
            amount: Number((shares[friendId] || 0).toFixed(2)),
            description: String(expense.title || 'Group expense'),
            date: expense.date,
            direction: 'you_paid',
          };
        }

        if (payerId === friendId && participantIds.includes(String(userId))) {
          return {
            type: 'expense',
            amount: Number((shares[String(userId)] || 0).toFixed(2)),
            description: String(expense.title || 'Group expense'),
            date: expense.date,
            direction: 'friend_paid',
          };
        }

        return null;
      })
      .filter((item: any) => item && Number(item.amount || 0) > 0);

    const settlements = await Settlement.find({
      status: 'completed',
      $or: [
        { fromUser: userId, toUser: friendId },
        { fromUser: friendId, toUser: userId },
      ],
    })
      .select('amount createdAt fromUser toUser')
      .lean();

    const settlementHistory = settlements.map((item: any) => ({
      type: 'settlement',
      amount: Number(item.amount || 0),
      date: item.createdAt,
      direction: toStringId(item.fromUser) === userId ? 'you_paid' : 'you_received',
    }));

    const data = [...expenseHistory, ...settlementHistory].sort(
      (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Get friend history error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch friend history' });
  }
};
