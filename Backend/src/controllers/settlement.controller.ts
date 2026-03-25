import {Response } from 'express';
import Trip from '../models/Trip.model';
import Expense from '../models/Expense.model';
import User from '../models/User.model';
import Group from '../models/Group.model';
import Settlement from '../models/Settlement.model';
import Notification from '../models/Notification.model';
import { AuthRequest } from '../middleware/auth.middleware';

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
