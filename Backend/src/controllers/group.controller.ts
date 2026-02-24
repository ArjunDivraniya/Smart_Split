import { Request, Response } from 'express';
import Group from '../models/Group.model';
import Trip from '../models/Trip.model';
import User from '../models/User.model';

// Create a new group
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

    // Create the group
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
      .populate('members.userId', 'name email');

    // Map the response to include both id and _id for compatibility
    const groupResponse = populatedGroup?.toObject() || {};
    
    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: {
        id: populatedGroup?._id?.toString(),
        ...groupResponse,
        _id: populatedGroup?._id?.toString(),
      },
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
export const getUserGroups = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    console.log('πŸ"„ Fetching groups for user:', userId);
    console.log('πŸ"„ User ID type:', typeof userId);

    if (!userId) {
      console.error('❌ No userId found in request');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - No user ID',
      });
    }

    // Query Groups collection - MongoDB will handle ObjectId matching
    console.log('Searching Group collection...');
    const groups = await Group.find({
      $or: [
        { createdBy: userId },
        { 'members.userId': userId },
      ],
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`βœ… Found ${groups.length} groups`);
    if (groups.length > 0) {
      console.log('📋 Sample group:', JSON.stringify(groups[0], null, 2));
    }

    // Query Trips collection
    console.log('Searching Trip collection...');
    const trips = await Trip.find({
      $or: [
        { createdBy: userId },
        { 'members.userId': userId },
      ],
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`βœ… Found ${trips.length} trips`);

    // Map _id to id for groups
    const mappedGroups = groups.map((group: any) => ({
      id: group._id.toString(),
      type: group.type || 'trip',
      ...group,
    }));

    // Map trips to group format for consistency
    const mappedTrips = trips.map((trip: any) => ({
      id: trip._id.toString(),
      type: 'trip',
      name: trip.name,
      emoji: '✈️',
      description: '',
      createdBy: trip.createdBy,
      members: trip.members?.map((m: any) => ({
        userId: m.userId?.toString?.() || m.userId,
        userName: m.name || 'Unknown',
        email: m.email || '',
        role: 'member',
      })) || [],
      expenses: trip.expenses || [],
      totalSpent: 0,
      netBalance: 0,
      isActive: trip.status === 'active',
      tripStartDate: trip.startDate,
      tripEndDate: trip.endDate,
      tripDestination: trip.destination,
      tripBudget: null,
      trackBudget: false,
      createdAt: trip.createdAt,
      updatedAt: trip.createdAt,
    }));

    // Combine and sort by date
    const allGroups = [...mappedGroups, ...mappedTrips].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    console.log(`πŸŽ‰ Returning ${allGroups.length} total groups/trips`);

    res.status(200).json({
      success: true,
      data: allGroups,
    });
  } catch (error: any) {
    console.error('❌ Error fetching groups:', error);
    console.error('Stack:', error.stack);
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

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const group = await Group.findById(id)
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email')
      .populate('expenses');

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found',
      });
    }

    // Check if user is member of group
    const isMember =
      group.createdBy?.toString() === userId ||
      group.members.some((m) => m.userId?.toString() === userId);

    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this group',
      });
    }

    // Map _id to id for frontend
    const groupObj = group.toObject();
    const mappedGroup = {
      id: groupObj._id,
      ...groupObj,
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
    const { name, description, tripBudget, trackBudget, tripDestination } = req.body;

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

    if (name) group.name = name;
    if (description) group.description = description;
    if (tripDestination) group.tripDestination = tripDestination;
    if (tripBudget) group.tripBudget = tripBudget;
    if (trackBudget !== undefined) group.trackBudget = trackBudget;

    await group.save();

    res.status(200).json({
      success: true,
      message: 'Group updated successfully',
      data: group,
    });
  } catch (error: any) {
    console.error('Error updating group:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update group',
    });
  }
};

// Delete group
export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

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

    await Group.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Group deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting group:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete group',
    });
  }
};

// Get settlements for a group
export const getGroupSettlements = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

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

    // For now, return empty settlements
    // In a real app, this would calculate settlements
    res.status(200).json({
      success: true,
      data: [],
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
export const getGroupTimeline = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

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
    const { amount, description, category, paidBy, splitAmong, date } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    if (!amount || !description) {
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

    // Check if user is a member
    const isMember = group.createdBy.toString() === userId || 
      group.members.some(m => m.userId.toString() === userId);
    
    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add expense to this group',
      });
    }

    // Create expense object
    const expense = {
      _id: new (require('mongoose')).Types.ObjectId(),
      amount: Number(amount),
      description,
      category: category || 'other',
      paidBy: paidBy || userId,
      splitAmong: splitAmong || [userId],
      date: date ? new Date(date) : new Date(),
    };

    // Add to group expenses array
    group.expenses.push(expense._id as any);
    
    // Update group totals
    group.totalSpent = (group.totalSpent || 0) + Number(amount);

    await group.save();

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: expense,
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

    // Check if user is a member
    const isMember = group.createdBy.toString() === userId || 
      group.members.some(m => m.userId.toString() === userId);
    
    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to remove expense from this group',
      });
    }

    // Find and remove expense
    const expenseIndex = group.expenses.findIndex(exp => exp.toString() === expenseId);
    if (expenseIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Expense not found',
      });
    }

    group.expenses.splice(expenseIndex, 1);
    await group.save();

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