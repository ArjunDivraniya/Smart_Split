import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Group from '../models/Group.model';
import User from '../models/User.model';
import Expense from '../models/Expense.model';
import Settlement from '../models/Settlement.model';

const toStringId = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value._id) return String(value._id);
  return String(value);
};

const ensureValidObjectId = (
  id: string | undefined,
  res: Response,
  label: string = 'Group'
): id is string => {
  if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({
      success: false,
      error: `Invalid ${label.toLowerCase()} id`,
    });
    return false;
  }
  return true;
};

const getMapValue = (source: any, key: string): number => {
  if (!source) return 0;
  if (source instanceof Map) return Number(source.get(key) || 0);
  if (typeof source === 'object') return Number(source[key] || 0);
  return 0;
};

const calculateExpenseShares = (expense: any, participantIds: string[]): Record<string, number> => {
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

const buildBalanceRows = (expenses: any[], usersMap: Record<string, string>) => {
  const balances: Record<string, { userId: string; userName: string; netBalance: number; paid: number; owedShare: number }> = {};

  Object.entries(usersMap).forEach(([userId, userName]) => {
    balances[userId] = { userId, userName, netBalance: 0, paid: 0, owedShare: 0 };
  });

  expenses.forEach((expense: any) => {
    const payerId = toStringId(expense.paidBy);
    const amount = Number(expense.amount || 0);
    const participants = Array.isArray(expense.splitBetween)
      ? expense.splitBetween.map((item: any) => toStringId(item)).filter(Boolean)
      : [];

    if (!participants.length) participants.push(payerId);

    if (!balances[payerId]) {
      balances[payerId] = { userId: payerId, userName: 'Unknown', netBalance: 0, paid: 0, owedShare: 0 };
    }

    balances[payerId].paid += amount;
    balances[payerId].netBalance += amount;

    const shares = calculateExpenseShares(expense, participants);
    participants.forEach((participantId: string) => {
      if (!balances[participantId]) {
        balances[participantId] = { userId: participantId, userName: 'Unknown', netBalance: 0, paid: 0, owedShare: 0 };
      }
      const shareAmount = Number(shares[participantId] || 0);
      balances[participantId].owedShare += shareAmount;
      balances[participantId].netBalance -= shareAmount;
    });
  });

  return Object.values(balances).map((row) => ({
    ...row,
    netBalance: Number(row.netBalance.toFixed(2)),
    paid: Number(row.paid.toFixed(2)),
    owedShare: Number(row.owedShare.toFixed(2)),
  }));
};

const optimizeSettlementGraph = (balanceRows: Array<{ userId: string; userName: string; netBalance: number }>) => {
  const creditors = balanceRows
    .filter((row) => row.netBalance > 0.01)
    .map((row) => ({ ...row, amount: row.netBalance }))
    .sort((a, b) => b.amount - a.amount);

  const debtors = balanceRows
    .filter((row) => row.netBalance < -0.01)
    .map((row) => ({ ...row, amount: Math.abs(row.netBalance) }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: Array<{
    fromUserId: string;
    fromUserName: string;
    toUserId: string;
    toUserName: string;
    amount: number;
  }> = [];

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const amount = Number(Math.min(creditor.amount, debtor.amount).toFixed(2));

    if (amount > 0) {
      settlements.push({
        fromUserId: debtor.userId,
        fromUserName: debtor.userName,
        toUserId: creditor.userId,
        toUserName: creditor.userName,
        amount,
      });
    }

    creditor.amount = Number((creditor.amount - amount).toFixed(2));
    debtor.amount = Number((debtor.amount - amount).toFixed(2));

    if (creditor.amount <= 0.01) creditorIndex += 1;
    if (debtor.amount <= 0.01) debtorIndex += 1;
  }

  return settlements;
};

// Create a new group (unified schema supports both regular groups and trip groups)
export const createGroup = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - user ID required',
      });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const {
      name,
      type,
      emoji,
      description,
      tripStartDate,
      tripEndDate,
      tripDestination,
      tripBudget,
      trackBudget,
    } = req.body;

    // Validation
    if (!name || !type || !emoji) {
      return res.status(400).json({
        success: false,
        error: 'Name, type, and emoji are required',
      });
    }

    if (type === 'trip') {
      if (!tripStartDate || !tripEndDate) {
        return res.status(400).json({
          success: false,
          error: 'Trip start and end dates are required for trip groups',
        });
      }

      const startDate = new Date(tripStartDate);
      const endDate = new Date(tripEndDate);
      if (endDate < startDate) {
        return res.status(400).json({
          success: false,
          error: 'End date must be after start date',
        });
      }
    }

    // Create the group (unified schema)
    const newGroup = new Group({
      name,
      type,
      emoji,
      description: description || '',
      createdBy: userId,
      members: [
        {
          userId: userId,
          userName: user.name || user.email || 'You',
          email: user.email,
          role: 'creator',
        },
      ],
      totalSpent: 0,
      netBalance: 0,
      isActive: true,
      // Trip-specific fields only set for trip type
      ...(type === 'trip' && {
        tripStartDate: new Date(tripStartDate),
        tripEndDate: new Date(tripEndDate),
        tripDestination: tripDestination || '',
        tripBudget: tripBudget ? Number(tripBudget) : null,
        trackBudget: trackBudget || false,
      }),
    });

    await newGroup.save();

    // Fetch the created group with populated references
    const populatedGroup = await Group.findById(newGroup._id)
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email')
      .lean()
      .orFail(new Error('Group created but failed to fetch created group'));

    // Map the response to include both id and _id for compatibility
    const mappedGroup = {
      ...populatedGroup,
      id: populatedGroup._id.toString(),
      _id: populatedGroup._id.toString(),
    };
    
    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: mappedGroup,
    });
  } catch (error: any) {
    console.error('Error creating group:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create group',
    });
  }
};

// Get all groups for a user
// Queries unified Groups collection which includes both regular groups and trip groups
// Returns a single array of groups with both 'id' and '_id' fields for frontend compatibility
export const getUserGroups = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - No user ID',
      });
    }

    // Query only Groups collection - unified collection includes both regular groups and trip groups
    const groups = await Group.find({
      $or: [
        { createdBy: userId },
        { 'members.userId': userId },
      ],
    })
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Convert to plain objects with both 'id' and '_id' for consistency
    const mappedGroups = groups.map((group: any) => ({
      ...group,
      id: group._id.toString(),
      _id: group._id.toString(),
    }));

    res.status(200).json({
      success: true,
      data: mappedGroups,
    });
  } catch (error: any) {
    console.error('❌ Error fetching groups:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch groups',
    });
  }
};

// Get a single group by ID
export const getGroupById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!ensureValidObjectId(id, res, 'Group')) {
      return;
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const group = await Group.findById(id)
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email')
      .populate('expenses')
      .lean();

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
    }

    // Check if user is member or creator
    const isMember =
      group.createdBy?._id?.toString() === userId ||
      group.members?.some((m: any) => m.userId?._id?.toString() === userId);

    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this group',
      });
    }

    // Map both 'id' and '_id' for consistency
    const mappedGroup = {
      ...group,
      id: group._id.toString(),
      _id: group._id.toString(),
    };

    res.status(200).json({
      success: true,
      data: mappedGroup,
    });
  } catch (error: any) {
    console.error('Error fetching group:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch group',
    });
  }
};

// Update group
export const updateGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!ensureValidObjectId(id, res, 'Group')) {
      return;
    }
    const {
      name,
      emoji,
      description,
      budget,
      tripBudget,
      trackBudget,
      tripDestination,
      status,
      coverImage,
      member,
      newMember,
      addMember,
      members,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
    }

    // Check if user is creator
    if (group.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Only group creator can update the group',
      });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'name')) {
      group.name = name;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'emoji')) {
      group.emoji = emoji;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {
      group.description = description;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'tripDestination')) {
      group.tripDestination = tripDestination;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'budget')) {
      group.tripBudget = budget === null || budget === '' ? null : Number(budget);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'tripBudget')) {
      group.tripBudget = tripBudget === null || tripBudget === '' ? null : Number(tripBudget);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'trackBudget')) {
      group.trackBudget = Boolean(trackBudget);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'status')) {
      if (status === 'archived' || status === 'completed') {
        group.status = 'completed';
        group.isActive = false;
      } else if (status === 'active') {
        group.status = 'active';
        group.isActive = true;
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'coverImage')) {
      (group as any).coverImage = coverImage || '';
    }

    const incomingMembers = [member, newMember, addMember]
      .filter(Boolean)
      .concat(Array.isArray(members) ? members : []);

    for (const entry of incomingMembers) {
      const entryUserId = entry?.userId || entry?._id || entry?.id;
      const entryEmail = entry?.email;

      let resolvedUser: any = null;
      if (entryUserId) {
        resolvedUser = await User.findById(entryUserId).select('name email').lean();
      } else if (entryEmail) {
        resolvedUser = await User.findOne({ email: String(entryEmail).toLowerCase() }).select('name email').lean();
      }

      if (!resolvedUser) {
        continue;
      }

      const resolvedId = String(resolvedUser._id);
      const exists = group.members.some((m: any) => toStringId(m.userId) === resolvedId);
      if (exists) {
        continue;
      }

      group.members.push({
        userId: resolvedUser._id,
        userName: resolvedUser.name || resolvedUser.email,
        email: resolvedUser.email,
        role: 'member',
        status: 'joined',
      } as any);
    }

    await group.save();

    const updatedGroup = await Group.findById(id)
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Group updated successfully',
      data: updatedGroup,
    });
  } catch (error: any) {
    console.error('Error updating group:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update group',
    });
  }
};

// Add member to group
export const addGroupMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { userId: newMemberUserId } = req.body;

    if (!ensureValidObjectId(id, res, 'Group')) {
      return;
    }

    if (!ensureValidObjectId(newMemberUserId, res, 'User')) {
      return;
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    if (!newMemberUserId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required',
      });
    }

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
    }

    // Only creator can add new members.
    if (toStringId(group.createdBy) !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Only group creator can add members',
      });
    }

    const userToAdd = await User.findById(newMemberUserId).select('name email').lean();
    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const alreadyMember = group.members.some((member: any) => toStringId(member.userId) === toStringId(userToAdd._id));
    if (alreadyMember) {
      const existingGroup = await Group.findById(id)
        .populate('createdBy', 'name email')
        .populate('members.userId', 'name email')
        .lean();

      return res.status(200).json({
        success: true,
        message: 'User is already a member of this group',
        data: existingGroup,
      });
    }

    await Group.findByIdAndUpdate(
      id,
      {
        $addToSet: {
          members: {
            userId: userToAdd._id,
            userName: userToAdd.name || userToAdd.email,
            email: userToAdd.email,
            role: 'member',
            status: 'joined',
          },
        },
      },
      { new: true }
    );

    const updatedGroup = await Group.findById(id)
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email')
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Member added successfully',
      data: updatedGroup,
    });
  } catch (error: any) {
    console.error('Error adding member to group:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to add member to group',
    });
  }
};

// Delete group
export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!ensureValidObjectId(id, res, 'Group')) {
      return;
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
    }

    // Check if user is creator
    if (group.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Only group creator can delete the group',
      });
    }

    const expenseIds = (group.expenses || []).map((expenseId: any) => expenseId);

    const deletedExpenses = await Expense.deleteMany({
      $or: [
        { group: id },
        ...(expenseIds.length > 0 ? [{ _id: { $in: expenseIds } }] : []),
      ],
    });

    const deletedSettlements = await Settlement.deleteMany({ group: id });

    await Group.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Group deleted successfully',
      data: {
        deletedExpenses: deletedExpenses.deletedCount || 0,
        deletedSettlements: deletedSettlements.deletedCount || 0,
      },
    });
  } catch (error: any) {
    console.error('Error deleting group:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete group',
    });
  }
};

// Get optimized settlements for a group
export const getGroupSettlements = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!ensureValidObjectId(id, res, 'Group')) {
      return;
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const group = await Group.findById(id)
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email')
      .lean();

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
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

    if (!Object.keys(usersMap).includes(userId)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view settlements',
      });
    }

    const expenses = await Expense.find({ group: id }).lean();
    const balances = buildBalanceRows(expenses, usersMap);
    const optimizedSettlements = optimizeSettlementGraph(balances);

    const settlementHistory = await Settlement.find({ group: id, status: 'completed' })
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        optimized: optimizedSettlements,
        balances,
        history: settlementHistory.map((item: any) => ({
          id: toStringId(item._id),
          fromUserId: toStringId(item.fromUser),
          fromUserName: item.fromUser?.name || 'Unknown',
          toUserId: toStringId(item.toUser),
          toUserName: item.toUser?.name || 'Unknown',
          amount: Number(item.amount || 0),
          note: item.note || '',
          createdAt: item.createdAt,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching settlements:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch settlements',
    });
  }
};

// Get timeline for a group
export const recordGroupSettlement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const { fromUserId, toUserId, amount, note } = req.body;

    if (!ensureValidObjectId(id, res, 'Group')) {
      return;
    }

    if (!ensureValidObjectId(fromUserId, res, 'User') || !ensureValidObjectId(toUserId, res, 'User')) {
      return;
    }

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!fromUserId || !toUserId || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'fromUserId, toUserId and positive amount are required',
      });
    }

    const group = await Group.findById(id).lean();
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    const memberIds = new Set<string>([
      toStringId(group.createdBy),
      ...(group.members || []).map((m: any) => toStringId(m.userId)).filter(Boolean),
    ]);

    if (!memberIds.has(userId) || !memberIds.has(String(fromUserId)) || !memberIds.has(String(toUserId))) {
      return res.status(403).json({ success: false, error: 'Users must belong to this group' });
    }

    const settlement = await Settlement.create({
      group: id,
      fromUser: fromUserId,
      toUser: toUserId,
      amount: Number(amount),
      note: note || '',
      createdBy: userId,
      status: 'completed',
    });

    return res.status(201).json({
      success: true,
      message: 'Settlement recorded successfully',
      data: {
        id: settlement._id.toString(),
        _id: settlement._id.toString(),
        fromUserId: String(fromUserId),
        toUserId: String(toUserId),
        amount: Number(amount),
        note: note || '',
        createdAt: settlement.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error recording settlement:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to record settlement' });
  }
};

export const getGroupSummary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!ensureValidObjectId(id, res, 'Group')) {
      return;
    }

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

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

    if (!Object.keys(usersMap).includes(userId)) {
      return res.status(403).json({ success: false, error: 'Not authorized to view summary' });
    }

    const expenses = await Expense.find({ group: id }).lean();
    const balances = buildBalanceRows(expenses, usersMap);

    const categoryBreakdown: Record<string, number> = {};
    expenses.forEach((expense: any) => {
      const category = expense.category || 'other';
      categoryBreakdown[category] = Number((categoryBreakdown[category] || 0) + Number(expense.amount || 0));
    });

    const mostSpentCategory = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const memberContributionMap: Record<string, number> = {};
    expenses.forEach((expense: any) => {
      const payerId = toStringId(expense.paidBy);
      memberContributionMap[payerId] = Number((memberContributionMap[payerId] || 0) + Number(expense.amount || 0));
    });

    const memberContributions = Object.entries(usersMap).map(([memberId, userName]) => ({
      userId: memberId,
      userName,
      amount: Number((memberContributionMap[memberId] || 0).toFixed(2)),
    }));

    const totalGroupSpend = Number(
      expenses.reduce((sum: number, expense: any) => sum + Number(expense.amount || 0), 0).toFixed(2)
    );

    const settlementHistory = await Settlement.find({ group: id, status: 'completed' })
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        groupId: id,
        totalGroupSpend,
        expenseCount: expenses.length,
        perMemberContribution: memberContributions,
        perMemberNetBalance: balances,
        categoryBreakdown,
        mostSpentCategory,
        settlementHistory: settlementHistory.map((item: any) => ({
          id: toStringId(item._id),
          fromUserName: item.fromUser?.name || 'Unknown',
          toUserName: item.toUser?.name || 'Unknown',
          amount: Number(item.amount || 0),
          note: item.note || '',
          createdAt: item.createdAt,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching group summary:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch summary' });
  }
};

export const getGroupTimeline = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    if (!ensureValidObjectId(id, res, 'Group')) {
      return;
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const group = await Group.findById(id).populate('expenses');

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
    }

    if (group.type !== 'trip') {
      return res.status(400).json({
        success: false,
        error: 'Timeline is only available for trip groups',
      });
    }

    // Return basic timeline structure
    res.status(200).json({
      success: true,
      data: {
        tripStartDate: group.tripStartDate,
        tripEndDate: group.tripEndDate,
        totalBudget: group.tripBudget,
        trackBudget: group.trackBudget,
        expenses: group.expenses || [],
      },
    });
  } catch (error: any) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch timeline',
    });
  }
};
// Add expense to group
export const addGroupExpense = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const userId = (req as any).userId;
    const {
      amount,
      description,
      title,
      category,
      paidBy,
      splitAmong,
      splitBetween,
      splitType,
      splitAmounts,
      splitPercentages,
      splitShares,
      date,
      receiptUrl,
      notes,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    if (!ensureValidObjectId(groupId, res, 'Group')) {
      return;
    }

    if (!amount || !(description || title)) {
      return res.status(400).json({
        success: false,
        error: 'Amount and description are required',
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
    }

    const participantIds = Array.isArray(splitBetween)
      ? splitBetween
      : Array.isArray(splitAmong)
      ? splitAmong
      : [userId];

    const isMember =
      group.createdBy.toString() === userId ||
      group.members.some((m) => m.userId.toString() === userId);

    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add expense to this group',
      });
    }

    const newExpense = await Expense.create({
      title: title || description,
      amount: Number(amount),
      category: category || 'other',
      paidBy: paidBy || userId,
      splitBetween: participantIds,
      splitType: splitType || 'equally',
      splitAmounts: splitAmounts || {},
      splitPercentages: splitPercentages || {},
      splitShares: splitShares || {},
      date: date ? new Date(date) : new Date(),
      receiptUrl: receiptUrl || undefined,
      notes: notes || '',
      group: groupId,
    });

    group.expenses.push(newExpense._id as any);
    group.totalSpent = Number((group.totalSpent || 0) + Number(amount));
    await group.save();

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: {
        ...newExpense.toObject(),
        id: newExpense._id.toString(),
        _id: newExpense._id.toString(),
        description: newExpense.title,
      },
    });
  } catch (error: any) {
    console.error('Error adding expense:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add expense',
    });
  }
};

// Remove expense from group
export const removeGroupExpense = async (req: Request, res: Response) => {
  try {
    const { groupId, expenseId } = req.params;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
    }

    const isMember =
      group.createdBy.toString() === userId ||
      group.members.some((m) => m.userId.toString() === userId);

    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to remove expense from this group',
      });
    }

    const expenseDoc = await Expense.findOne({ _id: expenseId, group: groupId });
    if (!expenseDoc) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found',
      });
    }

    group.expenses = group.expenses.filter((exp) => exp.toString() !== expenseId);
    group.totalSpent = Math.max(0, Number((group.totalSpent || 0) - Number(expenseDoc.amount || 0)));

    await Promise.all([group.save(), Expense.findByIdAndDelete(expenseId)]);

    res.status(200).json({
      success: true,
      message: 'Expense removed successfully',
    });
  } catch (error: any) {
    console.error('Error removing expense:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to remove expense',
    });
  }
};