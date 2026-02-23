import { Response } from 'express';
import User from '../models/User.model';
import Trip from '../models/Trip.model';
import Expense from '../models/Expense.model';
import { AuthRequest } from '../middleware/auth.middleware';
import bcrypt from 'bcryptjs';

// Get Profile Stats
export const getProfileStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Count total groups (trips user is part of)
    const totalGroups = await Trip.countDocuments({
      $or: [
        { createdBy: userId },
        { 'members.userId': userId },
      ],
    });

    // Count total expenses
    const userTrips = await Trip.find({
      $or: [
        { createdBy: userId },
        { 'members.userId': userId },
      ],
    }).select('_id');

    const tripIds = userTrips.map(trip => trip._id);
    const totalExpenses = await Expense.countDocuments({
      trip: { $in: tripIds },
    });

    // Count settlements (expenses where user was involved)
    const totalSettlements = await Expense.countDocuments({
      trip: { $in: tripIds },
      $or: [
        { paidBy: userId },
        { splitBetween: userId },
      ],
    });

    // Count active friends (unique users in trips)
    const trips = await Trip.find({
      $or: [
        { createdBy: userId },
        { 'members.userId': userId },
      ],
    }).populate('members.userId', '_id');

    const friendsSet = new Set<string>();
    trips.forEach(trip => {
      if (trip.createdBy.toString() !== userId) {
        friendsSet.add(trip.createdBy.toString());
      }
      trip.members.forEach((member: any) => {
        if (member.userId && member.userId._id.toString() !== userId) {
          friendsSet.add(member.userId._id.toString());
        }
      });
    });
    const activeFriends = friendsSet.size;

    // Calculate Financial Health Score
    const expenses = await Expense.find({
      trip: { $in: tripIds },
    }).populate('paidBy', '_id');

    let totalSpent = 0;
    let totalOwe = 0;
    let onTimeSettlements = 0;

    expenses.forEach((expense: any) => {
      const isPaidByUser = expense.paidBy._id.toString() === userId;
      totalSpent += expense.amount;

      if (expense.splitBetween && expense.splitBetween.length > 0) {
        const splitAmount = expense.amount / expense.splitBetween.length;
        if (!isPaidByUser) {
          const userInSplit = expense.splitBetween.some(
            (memberId: any) => memberId.toString() === userId
          );
          if (userInSplit) {
            totalOwe += splitAmount;
          }
        } else {
          onTimeSettlements++;
        }
      }
    });

    // Calculate score (0-100)
    let financialHealthScore = 70; // Base score

    // Penalty for pending settlements
    if (totalOwe > 0) {
      const oweRatio = totalOwe / (totalSpent || 1);
      financialHealthScore -= Math.min(oweRatio * 50, 30);
    }

    // Bonus for on-time settlements
    if (totalExpenses > 0) {
      const settlementRatio = onTimeSettlements / totalExpenses;
      financialHealthScore += settlementRatio * 20;
    }

    // Bonus for active tracking
    if (totalExpenses > 20) {
      financialHealthScore += 10;
    }

    financialHealthScore = Math.max(0, Math.min(100, Math.round(financialHealthScore)));

    return res.status(200).json({
      success: true,
      data: {
        totalGroups,
        totalExpenses,
        totalSettlements,
        activeFriends,
        financialHealthScore,
      },
    });
  } catch (error: any) {
    console.error('Get profile stats error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update User Preferences
export const updatePreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { preferences } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { preferences },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Preferences updated',
      data: user.preferences,
    });
  } catch (error: any) {
    console.error('Update preferences error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Change Password
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters' 
      });
    }

    // Get user with password
    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has a password (not Google auth)
    if (!user.password) {
      return res.status(400).json({ 
        message: 'Cannot change password for Google authenticated accounts' 
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Export Data
export const exportData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user data
    const user = await User.findById(userId).select('-password');

    // Get all trips
    const trips = await Trip.find({
      $or: [
        { createdBy: userId },
        { 'members.userId': userId },
      ],
    }).populate('createdBy', 'name email')
      .populate('members.userId', 'name email');

    const tripIds = trips.map(trip => trip._id);

    // Get all expenses
    const expenses = await Expense.find({
      trip: { $in: tripIds },
    }).populate('paidBy', 'name email')
      .populate('trip', 'name destination');

    // Format export data
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        upiId: user?.upiId,
      },
      stats: {
        totalTrips: trips.length,
        totalExpenses: expenses.length,
      },
      trips: trips.map(trip => ({
        name: trip.name,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        status: trip.status,
        members: trip.members.length,
        expenses: trip.expenses.length,
      })),
      expenses: expenses.map((expense: any) => ({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        paidBy: expense.paidBy?.name,
        trip: expense.trip?.name,
        date: expense.date,
        splitType: expense.splitType,
      })),
    };

    return res.status(200).json({
      success: true,
      data: exportData,
      summary: {
        personalExpenses: expenses.length,
        groups: trips.length,
        friends: trips.reduce((acc, trip) => acc + trip.members.length, 0),
      },
    });
  } catch (error: any) {
    console.error('Export data error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Reset Savings Goal
export const resetSavingsGoal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 'preferences.savingsGoal': 5000 },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Savings goal reset to ₹5000',
      data: user.preferences,
    });
  } catch (error: any) {
    console.error('Reset savings goal error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update Budget & Goals
export const updateBudgetGoals = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { monthlyIncome, monthlyBudget, savingsGoal } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const updateData: any = {};
    if (monthlyIncome !== undefined) updateData['preferences.monthlyIncome'] = monthlyIncome;
    if (monthlyBudget !== undefined) updateData['preferences.monthlyBudget'] = monthlyBudget;
    if (savingsGoal !== undefined) updateData['preferences.savingsGoal'] = savingsGoal;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Budget & goals updated',
      data: user.preferences,
    });
  } catch (error: any) {
    console.error('Update budget goals error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update Payment Preferences
export const updatePaymentPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { paymentPreferences } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!paymentPreferences) {
      return res.status(400).json({ message: 'Payment preferences are required' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { paymentPreferences },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment preferences updated',
      data: user.paymentPreferences,
    });
  } catch (error: any) {
    console.error('Update payment preferences error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update Expense Categories
export const updateCategories = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { expenseCategories } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!Array.isArray(expenseCategories)) {
      return res.status(400).json({ message: 'Expense categories must be an array' });
    }

    // Ensure at least one category is enabled
    const enabledCategories = expenseCategories.filter((cat: any) => cat.enabled);
    if (enabledCategories.length === 0) {
      return res.status(400).json({ message: 'At least one category must be enabled' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { expenseCategories },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Expense categories updated',
      data: user.expenseCategories,
    });
  } catch (error: any) {
    console.error('Update categories error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update Privacy Settings
export const updatePrivacySettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { privacySettings } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!privacySettings) {
      return res.status(400).json({ message: 'Privacy settings are required' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { privacySettings },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Privacy settings updated',
      data: user.privacySettings,
    });
  } catch (error: any) {
    console.error('Update privacy settings error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update Security Settings (App Lock & Biometric)
export const updateSecuritySettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { appLockEnabled, fingerprintEnabled, faceRecognitionEnabled, pinCode } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const securitySettings: any = {};

    if (appLockEnabled !== undefined) {
      securitySettings.appLockEnabled = appLockEnabled;
      if (appLockEnabled && pinCode) {
        // Hash the PIN before storing
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        securitySettings.pinCode = await bcrypt.hash(pinCode, salt);
      } else if (!appLockEnabled) {
        securitySettings.pinCode = null;
      }
    }

    if (fingerprintEnabled !== undefined) {
      securitySettings.fingerprintEnabled = fingerprintEnabled;
    }

    if (faceRecognitionEnabled !== undefined) {
      securitySettings.faceRecognitionEnabled = faceRecognitionEnabled;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { securitySettings },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return without pinCode in response
    const response = {
      appLockEnabled: user.securitySettings.appLockEnabled,
      fingerprintEnabled: user.securitySettings.fingerprintEnabled,
      faceRecognitionEnabled: user.securitySettings.faceRecognitionEnabled,
    };

    return res.status(200).json({
      success: true,
      message: 'Security settings updated',
      data: response,
    });
  } catch (error: any) {
    console.error('Update security settings error:', error);
    return res.status(500).json({ message: error.message });
  }
};
