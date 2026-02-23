import { Router } from 'express';
import {
  getProfileStats,
  updatePreferences,
  changePassword,
  exportData,
  resetSavingsGoal,
  updateBudgetGoals,
  updatePaymentPreferences,
  updateCategories,
  updatePrivacySettings,
  updateSecuritySettings,
} from '../controllers/profile.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All profile routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/profile/stats
 * @desc    Get user profile statistics (groups, expenses, settlements, friends, health score)
 * @access  Private
 */
router.get('/stats', getProfileStats);

/**
 * @route   PUT /api/profile/preferences
 * @desc    Update user preferences (theme, notifications, etc.)
 * @access  Private
 */
router.put('/preferences', updatePreferences);

/**
 * @route   PUT /api/profile/budget-goals
 * @desc    Update monthly income, budget, and savings goal
 * @access  Private
 */
router.put('/budget-goals', updateBudgetGoals);

/**
 * @route   PUT /api/profile/payment-preferences
 * @desc    Update UPI ID, bank account, and auto-pay settings
 * @access  Private
 */
router.put('/payment-preferences', updatePaymentPreferences);

/**
 * @route   PUT /api/profile/categories
 * @desc    Update expense categories
 * @access  Private
 */
router.put('/categories', updateCategories);

/**
 * @route   PUT /api/profile/privacy
 * @desc    Update privacy settings
 * @access  Private
 */
router.put('/privacy', updatePrivacySettings);

/**
 * @route   PUT /api/profile/security
 * @desc    Update security settings (app lock, biometric)
 * @access  Private
 */
router.put('/security', updateSecuritySettings);

/**
 * @route   PUT /api/profile/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', changePassword);

/**
 * @route   GET /api/profile/export
 * @desc    Export all user data (trips, expenses) as JSON
 * @access  Private
 */
router.get('/export', exportData);

/**
 * @route   POST /api/profile/reset-savings
 * @desc    Reset savings goal to default value
 * @access  Private
 */
router.post('/reset-savings', resetSavingsGoal);

export default router;
