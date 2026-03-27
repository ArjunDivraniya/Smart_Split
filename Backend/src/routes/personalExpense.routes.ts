import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  createPersonalExpense,
  deletePersonalExpense,
  getPersonalExpenseById,
  getPersonalExpenses,
  getPersonalExpensesSummary,
  updatePersonalExpense,
} from '../controllers/personalExpense.controller';

const router = Router();

router.use(authenticateToken);

/**
 * @route POST /api/personal-expenses
 * @desc Create a personal expense for current user
 * @access Private
 */
router.post('/', createPersonalExpense);

/**
 * @route GET /api/personal-expenses
 * @desc Get personal expenses list with filters/pagination
 * @access Private
 */
router.get('/', getPersonalExpenses);

/**
 * @route GET /api/personal-expenses/summary
 * @desc Get monthly personal expense summary grouped by category
 * @access Private
 */
router.get('/summary', getPersonalExpensesSummary);

/**
 * @route GET /api/personal-expenses/:id
 * @desc Get single personal expense by id
 * @access Private
 */
router.get('/:id', getPersonalExpenseById);

/**
 * @route PUT /api/personal-expenses/:id
 * @desc Update personal expense by id
 * @access Private
 */
router.put('/:id', updatePersonalExpense);

/**
 * @route DELETE /api/personal-expenses/:id
 * @desc Delete personal expense by id
 * @access Private
 */
router.delete('/:id', deletePersonalExpense);

export default router;
