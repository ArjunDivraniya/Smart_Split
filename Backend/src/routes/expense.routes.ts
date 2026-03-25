import { Router } from 'express';
import { addExpense, updateExpense, deleteExpense, getGroupExpenses, getGroupBalances } from '../controllers/expense.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All expense routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/expenses/add
 * @desc    Add a new expense to a trip
 * @access  Private
 */
router.post('/add', addExpense);

/**
 * @route   GET /api/expenses/group/:id
 * @desc    Get all expenses for a group
 * @access  Private
 */
router.get('/group/:id', getGroupExpenses);

/**
 * @route   GET /api/expenses/group/:id/balances
 * @desc    Get computed balances for a group
 * @access  Private
 */
router.get('/group/:id/balances', getGroupBalances);

/**
 * @route   PUT /api/expenses/:id
 * @desc    Update an expense
 * @access  Private (Payer or group creator)
 */
router.put('/:id', updateExpense);

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Delete an expense
 * @access  Private (Payer or group creator)
 */
router.delete('/:id', deleteExpense);

export default router;
