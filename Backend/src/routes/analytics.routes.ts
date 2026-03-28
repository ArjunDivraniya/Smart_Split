import { Router } from 'express';
import {
  getAnalytics,
  getCategoryAnalytics,
  getFriendSpendingAnalytics,
  getGroupVsPersonalAnalytics,
  getMonthlyAnalytics,
  getRecentActivity,
  getDashboardInsights,
  getDashboardSummary,
} from '../controllers/analytics.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All analytics routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/analytics/monthly
 * @desc    Get monthly spending data for last 6 months (personal, group, total)
 * @access  Private
 */
router.get('/monthly', getMonthlyAnalytics);

/**
 * @route   GET /api/analytics/categories?month=2&year=2025
 * @desc    Get category-wise spending breakdown for a specific month
 * @access  Private
 */
router.get('/categories', getCategoryAnalytics);

/**
 * @route   GET /api/analytics/group-vs-personal
 * @desc    Get 6-month group vs personal spending comparison
 * @access  Private
 */
router.get('/group-vs-personal', getGroupVsPersonalAnalytics);

/**
 * @route   GET /api/analytics/friend-spending
 * @desc    Get top friends by shared group spending
 * @access  Private
 */
router.get('/friend-spending', getFriendSpendingAnalytics);

/**
 * @route   GET /api/analytics/trip/:id
 * @desc    Get analytics for a specific trip (category breakdown, member spending)
 * @access  Private
 */
router.get('/trip/:id', getAnalytics);

/**
 * @route   GET /api/analytics/recent-activity
 * @desc    Get last 10 expenses across all user's trips
 * @access  Private
 */
router.get('/recent-activity', getRecentActivity);

/**
 * @route   GET /api/analytics/insights
 * @desc    Get dashboard insights (top spending category with emoji)
 * @access  Private
 */
router.get('/insights', getDashboardInsights);

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard summary (financial overview and smart alerts)
 * @access  Private
 */
router.get('/dashboard', getDashboardSummary);

export default router;
