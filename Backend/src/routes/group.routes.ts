import express, { Router } from 'express';
import {
  createGroup,
  getUserGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  getGroupSettlements,
  getGroupTimeline,
  addGroupExpense,
  removeGroupExpense,
} from '../controllers/group.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router: Router = express.Router();

/**
 * @route GET /api/groups/health/check
 * @desc Health check - check if groups collection exists
 * @access Public (no auth required)
 */
router.get('/health/check', async (req, res) => {
  try {
    const Group = require('../models/Group.model').default;
    const count = await Group.countDocuments();
    res.json({
      message: 'API Health Check',
      groupsCollectionCount: count,
      status: 'ok'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Apply authentication middleware to all routes below this
router.use(authenticateToken);

/**
 * @route GET /api/groups/debug/all-groups
 * @desc Debug endpoint - Get ALL groups in database
 * @access Private
 */
router.get('/debug/all-groups', async (req, res) => {
  try {
    const Group = require('../models/Group.model').default;
    const userId = (req as any).userId;
    const allGroups = await Group.find().lean();
    
    console.log('βš™οΈ DEBUG: Current User ID:', userId, 'Type:', typeof userId);
    console.log('βš™οΈ DEBUG: Groups in DB:', allGroups.length);
    
    allGroups.forEach((g: any, i: number) => {
      console.log(`\nβš™οΈ Group ${i+1}:`);
      console.log('  _id:', g._id, 'Type:', typeof g._id);
      console.log('  createdBy:', g.createdBy, 'Type:', typeof g.createdBy);
      console.log('  name:', g.name);
      console.log('  members:', g.members?.length || 0);
    });
    
    res.json({
      currentUserId: userId,
      userIdType: typeof userId,
      totalGroupsInDB: allGroups.length,
      groups: allGroups.map((g: any) => ({
        id: g._id,
        createdBy: g.createdBy,
        name: g.name,
        createdByType: String(typeof g.createdBy),
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/groups
 * @desc Create a new group
 * @access Private
 */
router.post('/', createGroup);

/**
 * @route GET /api/groups
 * @desc Get all groups for the current user
 * @access Private
 */
router.get('/', getUserGroups);

/**
 * @route GET /api/groups/:id
 * @desc Get a specific group by ID
 * @access Private
 */
router.get('/:id', getGroupById);

/**
 * @route PUT /api/groups/:id
 * @desc Update a group
 * @access Private
 */
router.put('/:id', updateGroup);

/**
 * @route DELETE /api/groups/:id
 * @desc Delete a group
 * @access Private
 */
router.delete('/:id', deleteGroup);

/**
 * @route GET /api/groups/:id/settlements
 * @desc Get settlement information for a group
 * @access Private
 */
router.get('/:id/settlements', getGroupSettlements);

/**
 * @route GET /api/groups/:id/timeline
 * @desc Get timeline information for a trip group
 * @access Private
 */
router.get('/:id/timeline', getGroupTimeline);

/**
 * @route POST /api/groups/:groupId/expenses
 * @desc Add an expense to a group
 * @access Private
 */
router.post('/:groupId/expenses', addGroupExpense);

/**
 * @route DELETE /api/groups/:groupId/expenses/:expenseId
 * @desc Remove an expense from a group
 * @access Private
 */
router.delete('/:groupId/expenses/:expenseId', removeGroupExpense);

export default router;
