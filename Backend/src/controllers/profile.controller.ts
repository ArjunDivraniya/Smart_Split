import { Response } from 'express';
import User from '../models/User.model';
import Trip from '../models/Trip.model';
import Expense from '../models/Expense.model';
import Group from '../models/Group.model';
import PersonalExpense from '../models/PersonalExpense.model';
import Settlement from '../models/Settlement.model';
import { AuthRequest } from '../middleware/auth.middleware';
import bcrypt from 'bcryptjs';
import cloudinary from '../config/cloudinary';

const formatMemberSince = (createdAt?: Date): string => {
  const date = createdAt ? new Date(createdAt) : new Date();
  const formatted = date.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  return `Member since ${formatted}`;
};

const mapProfileUser = (user: any) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  upiId: user.upiId || '',
  avatar: user.profileImage || '',
  monthlyIncome: Number(user.preferences?.monthlyIncome || 0),
  savingsGoal: Number(user.preferences?.savingsGoal || 0),
  preferences: user.preferences,
  createdAt: user.createdAt,
});

// Get full user profile + computed stats
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId)
      .select('name email phone upiId profileImage preferences createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [
      totalGroups,
      totalPersonalExpenses,
      personalTotalsAgg,
      thisMonthAgg,
      totalSettled,
      totalGroupsCreated,
    ] = await Promise.all([
      Group.countDocuments({
        $or: [{ createdBy: userId }, { 'members.userId': userId }],
      }),
      PersonalExpense.countDocuments({ user: userId }),
      PersonalExpense.aggregate<{ totalSpent: number }>([
        {
          $match: { user: user._id },
        },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: '$amount' },
          },
        },
      ]),
      PersonalExpense.aggregate<{ thisMonthSpent: number }>([
        {
          $match: {
            user: user._id,
            expenseDate: { $gte: monthStart, $lt: nextMonthStart },
          },
        },
        {
          $group: {
            _id: null,
            thisMonthSpent: { $sum: '$amount' },
          },
        },
      ]),
      Settlement.countDocuments({
        status: 'completed',
        $or: [{ fromUser: userId }, { toUser: userId }],
      }),
      Group.countDocuments({ createdBy: userId }),
    ]);

    const totalSpent = Number(personalTotalsAgg[0]?.totalSpent || 0);
    const thisMonthSpent = Number(thisMonthAgg[0]?.thisMonthSpent || 0);

    return res.status(200).json({
      user: mapProfileUser(user),
      stats: {
        totalGroups,
        totalPersonalExpenses,
        totalSpent,
        thisMonthSpent,
        totalSettled,
        totalGroupsCreated,
        memberSince: formatMemberSince(user.createdAt as Date),
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update basic profile fields
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name, phone, upiId, avatar, monthlyIncome, savingsGoal } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const updateData: Record<string, any> = {};

    if (name !== undefined) {
      const normalizedName = String(name).trim();
      if (!normalizedName) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }
      updateData.name = normalizedName;
    }

    if (phone !== undefined) {
      const normalizedPhone = String(phone).trim();
      if (!/^\d{10}$/.test(normalizedPhone)) {
        return res.status(400).json({ message: 'Phone must be 10 digits' });
      }
      updateData.phone = normalizedPhone;
    }

    if (upiId !== undefined) {
      const normalizedUpiId = String(upiId).trim();
      if (normalizedUpiId && !normalizedUpiId.includes('@')) {
        return res.status(400).json({ message: 'UPI ID must contain @' });
      }
      updateData.upiId = normalizedUpiId;
    }

    if (avatar !== undefined) {
      const avatarStr = String(avatar).trim();
      if (avatarStr.startsWith('data:image')) {
        try {
          const existingUser = await User.findById(userId);
          if (existingUser && existingUser.publicId) {
             try { await cloudinary.uploader.destroy(existingUser.publicId); } catch(e) { console.log('Delete old image error ignored:', e); }
          }
          
          const base64Data = avatarStr.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");

          const uploadRes: any = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'trip-splitter-profiles' },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            stream.end(buffer);
          });
          
          updateData.profileImage = uploadRes.secure_url;
          updateData.publicId = uploadRes.public_id;
        } catch (uploadErr: any) {
          console.error('Cloudinary upload error:', uploadErr);
          return res.status(500).json({ message: 'Failed to upload image to Cloudinary: ' + (uploadErr?.message || 'Unknown error') });
        }
      } else {
        updateData.profileImage = avatarStr;
      }
    }

    if (monthlyIncome !== undefined) {
      const normalizedIncome = Number(monthlyIncome);
      if (!Number.isFinite(normalizedIncome) || normalizedIncome < 0) {
        return res.status(400).json({ message: 'monthlyIncome must be a non-negative number' });
      }
      updateData['preferences.monthlyIncome'] = normalizedIncome;
    }

    if (savingsGoal !== undefined) {
      const normalizedGoal = Number(savingsGoal);
      if (!Number.isFinite(normalizedGoal) || normalizedGoal < 0) {
        return res.status(400).json({ message: 'savingsGoal must be a non-negative number' });
      }
      updateData['preferences.savingsGoal'] = normalizedGoal;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: 'At least one field is required: name, phone, upiId, avatar, monthlyIncome, savingsGoal',
      });
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    })
      .select('name email phone upiId profileImage preferences createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(mapProfileUser(user));
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: error.message });
  }
};

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
    const payload = req.body?.preferences ?? req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const updateData: Record<string, any> = {};

    if (payload?.currency !== undefined) {
      updateData['preferences.currency'] = String(payload.currency).trim();
    }

    if (payload?.theme !== undefined) {
      const allowedThemes = ['dark', 'light', 'system'];
      if (!allowedThemes.includes(payload.theme)) {
        return res.status(400).json({ message: 'theme must be one of: dark, light, system' });
      }
      updateData['preferences.theme'] = payload.theme;
    }

    if (payload?.defaultSplit !== undefined) {
      updateData['preferences.defaultSplit'] = payload.defaultSplit;
    }

    if (payload?.notifications !== undefined) {
      if (typeof payload.notifications !== 'object' || payload.notifications === null) {
        return res.status(400).json({ message: 'preferences.notifications must be an object' });
      }
      updateData['preferences.notifications'] = payload.notifications;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: 'At least one field is required: currency, theme, defaultSplit, notifications',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user.preferences);
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

    const user = await User.findById(userId).select('name email').lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [personalExpenses, groups, settlements] = await Promise.all([
      PersonalExpense.find({ user: userId }).sort({ expenseDate: -1 }).lean(),
      Group.find({
        $or: [{ createdBy: userId }, { 'members.userId': userId }],
      })
        .populate('createdBy', 'name email')
        .populate('members.userId', 'name email')
        .populate({
          path: 'expenses',
          populate: [
            { path: 'paidBy', select: 'name email' },
            { path: 'splitBetween', select: 'name email' },
          ],
        })
        .sort({ createdAt: -1 })
        .lean(),
      Settlement.find({
        $or: [{ fromUser: userId }, { toUser: userId }],
      })
        .populate('fromUser', 'name email')
        .populate('toUser', 'name email')
        .populate('createdBy', 'name email')
        .populate('group', 'name type')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return res.status(200).json({
      exportedAt: new Date().toISOString(),
      user: {
        name: user.name,
        email: user.email,
      },
      personalExpenses,
      groups,
      settlements,
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
