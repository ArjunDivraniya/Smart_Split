import { Response } from 'express';
import Trip from '../models/Trip.model';
import Expense from '../models/Expense.model';
import User from '../models/User.model';
import Activity from '../models/Activity.model';
import PackingItem from '../models/PackingItem.model';
import Message from '../models/Message.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendNotification } from '../utils/notification';

// Create Trip
export const createTrip = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name, destination, startDate, endDate, members } = req.body;

    if (!name || !destination || !startDate || !endDate) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    // Process Members: Look up User IDs for emails
    const memberList = await Promise.all(
      members.map(async (m: any) => {
        const existingUser = await User.findOne({ email: m.email });
        return {
          email: m.email,
          userId: existingUser ? existingUser._id : null,
          status: 'invited',
        };
      })
    );

    // Add creator as a joined member
    const creator = await User.findById(userId);
    if (creator) {
      const isCreatorAdded = memberList.some((m: any) => m.email === creator.email);
      if (!isCreatorAdded) {
        memberList.push({ email: creator.email, userId: creator._id, status: 'joined' });
      }
    }

    const newTrip = new Trip({
      name,
      destination,
      startDate,
      endDate,
      createdBy: userId,
      members: memberList,
      status: 'active',
    });

    const savedTrip = await newTrip.save();

    return res.status(201).json({
      message: 'Trip created successfully',
      success: true,
      tripId: savedTrip._id,
    });
  } catch (error: any) {
    console.error('Create trip error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get User's Trips
export const getUserTrips = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    // Find trips where user is creator or member
    const trips = await Trip.find({
      $or: [{ createdBy: userId }, { 'members.userId': userId }],
    })
      .sort({ createdAt: -1 })
      .populate('members.userId', 'name profileImage');

    // Calculate totals
    const tripIds = trips.map((t) => t._id);
    const expenses = await Expense.find({ trip: { $in: tripIds } });

    const tripStats: Record<string, { total: number; balance: number }> = {};
    
    expenses.forEach((expense) => {
      const tid = expense.trip?.toString();
      if (!tid) return;
      if (!tripStats[tid]) tripStats[tid] = { total: 0, balance: 0 };
      tripStats[tid].total += expense.amount;

      const paidById = expense.paidBy.toString();
      const splitCount = expense.splitBetween.length;
      const splitAmount = expense.amount / (splitCount || 1);

      if (paidById === userId) tripStats[tid].balance += expense.amount;
      const isInSplit = expense.splitBetween.some((id: any) => id.toString() === userId);
      if (isInSplit) tripStats[tid].balance -= splitAmount;
    });

    // Format data
    const tripsWithData = trips.map((trip) => {
      const stats = tripStats[trip._id.toString()] || { total: 0, balance: 0 };

      let userStatus = 'joined';
      if (trip.createdBy.toString() !== userId) {
        const memberRecord = trip.members.find((m: any) => m.userId?._id.toString() === userId);
        userStatus = memberRecord ? memberRecord.status : 'invited';
      }

      const joinedMembersCount = trip.members.filter((m: any) => m.status === 'joined').length;
      const activeMemberCount = joinedMembersCount + 1; // +1 for creator

      return {
        ...trip.toObject(),
        totalExpense: stats.total,
        yourBalance: Math.round(stats.balance),
        userStatus: userStatus,
        isAdmin: trip.createdBy.toString() === userId,
        membersCount: activeMemberCount,
      };
    });

    return res.status(200).json({
      success: true,
      data: tripsWithData,
    });
  } catch (error: any) {
    console.error('Get user trips error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get Trip Details with full balance calculation
export const getTripDetails = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const trip = await Trip.findById(id)
      .populate('members.userId', 'name email profileImage')
      .populate('createdBy', 'name email profileImage');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const expenses = await Expense.find({ trip: id })
      .populate('paidBy', 'name')
      .populate('splitBetween', 'name')
      .sort({ date: -1 });

    // Calculate balances (full logic from Next.js implementation)
    let totalTripExpense = 0;
    const totalPaid: Record<string, number> = {};
    const totalShare: Record<string, number> = {};
    const memberBalances: Record<string, number> = {};
    const userRegistry: Set<string> = new Set();

    const registerMember = (user: any, status?: string) => {
      if (!user) return null;
      if (status && status !== 'joined') return null;
      const uid = user._id.toString();
      if (!userRegistry.has(uid)) {
        userRegistry.add(uid);
        totalPaid[uid] = 0;
        totalShare[uid] = 0;
      }
      return uid;
    };

    registerMember(trip.createdBy, 'joined');
    trip.members.forEach((m: any) => registerMember(m.userId, m.status));

    expenses.forEach((expense: any) => {
      const amount = Number(expense.amount);
      totalTripExpense += amount;
      const payerId = expense.paidBy._id.toString();
      const amountPaise = Math.round(amount * 100);

      if (!userRegistry.has(payerId)) {
        registerMember(expense.paidBy, 'joined');
      }

      const beneficiaries = expense.splitBetween
        .map((u: any) => {
          const uid = u._id.toString();
          if (!userRegistry.has(uid)) {
            registerMember(u, 'joined');
          }
          return uid;
        })
        .filter((uid: string) => userRegistry.has(uid));

      if (beneficiaries.length === 0) return;

      if (userRegistry.has(payerId)) {
        totalPaid[payerId] += amountPaise;
      }

      beneficiaries.forEach((beneficiaryId: string, idx: number) => {
        let sharePaise = 0;
        if (expense.splitAmounts && expense.splitAmounts.get && expense.splitAmounts.get(beneficiaryId)) {
          sharePaise = Math.round(expense.splitAmounts.get(beneficiaryId) * 100);
        } else {
          const baseSharePaise = Math.floor(amountPaise / beneficiaries.length);
          const remainderPaise = amountPaise - baseSharePaise * beneficiaries.length;
          sharePaise = baseSharePaise + (idx < remainderPaise ? 1 : 0);
        }
        totalShare[beneficiaryId] += sharePaise;
      });
    });

    userRegistry.forEach((userId) => {
      memberBalances[userId] = totalPaid[userId] - totalShare[userId];
    });

    const membersWithBalances = Array.from(userRegistry).map((uid) => {
      const user: any = trip.members.find((m: any) => m.userId?._id.toString() === uid)?.userId ||
                   (trip.createdBy._id.toString() === uid ? trip.createdBy : null);
      return {
        userId: uid,
        name: user?.name || 'Unknown',
        email: user?.email || '',
        profileImage: user?.profileImage || '',
        totalPaid: totalPaid[uid] / 100,
        totalShare: totalShare[uid] / 100,
        balance: memberBalances[uid] / 100,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        trip,
        expenses,
        totalTripExpense,
        membersWithBalances,
      },
    });
  } catch (error: any) {
    console.error('Get trip details error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Add Member to Trip
export const addMemberToTrip = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (trip.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Only the admin can add members' });
    }

    const isAlreadyMember = trip.members.some((m: any) => m.email === email);
    if (isAlreadyMember) {
      return res.status(400).json({ message: 'User is already added or invited' });
    }

    const existingUser = await User.findOne({ email });
    const newMemberId = existingUser ? existingUser._id : undefined;

    trip.members.push({
      email,
      userId: newMemberId,
      status: 'invited',
    });

    await trip.save();

    if (newMemberId) {
      await sendNotification([newMemberId.toString()], userId!, id, `Invited you to join "${trip.name}"`, 'invite');
    }

    return res.status(200).json({
      success: true,
      message: 'Member invited successfully',
      data: trip,
    });
  } catch (error: any) {
    console.error('Add member error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Respond to Trip Invitation
export const respondToInvite = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { action } = req.body;

    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const memberIndex = trip.members.findIndex((m: any) => m.userId && m.userId.toString() === userId);

    if (memberIndex === -1) {
      return res.status(403).json({ message: 'You are not invited to this trip' });
    }

    if (action === 'accept') {
      trip.members[memberIndex].status = 'joined';
      await trip.save();

      await sendNotification([trip.createdBy.toString()], userId!, id, 'Accepted your trip invitation', 'system');

      return res.status(200).json({ success: true, message: 'Invitation accepted' });
    } else if (action === 'reject') {
      trip.members.splice(memberIndex, 1);
      await trip.save();
      return res.status(200).json({ success: true, message: 'Invitation rejected' });
    }

    return res.status(400).json({ message: 'Invalid action' });
  } catch (error: any) {
    console.error('Respond to invite error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// End Trip
export const endTrip = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (trip.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Only the admin can end this trip' });
    }

    trip.status = 'completed';
    await trip.save();

    return res.status(200).json({
      success: true,
      message: 'Trip ended successfully',
      data: trip,
    });
  } catch (error: any) {
    console.error('End trip error:', error);
    return res.status(500).json({ message: error.message });
  }
};
