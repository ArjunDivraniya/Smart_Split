import { Router } from 'express';
import { addExpense, updateExpense, deleteExpense } from '../controllers/expense.controller';
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
 * @route   PUT /api/expenses/:id
 * @desc    Update an expense
 * @access  Private (Only expense creator)
 */
router.put('/:id', updateExpense);

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Delete an expense
 * @access  Private (Only expense creator)
 */
router.delete('/:id', deleteExpense);

export default router;
