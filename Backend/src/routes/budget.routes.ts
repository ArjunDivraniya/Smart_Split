import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { createBudget, deleteBudget, getBudgetStatus, updateBudget } from '../controllers/budget.controller';

const router = Router();

router.use(authenticateToken);

// POST /api/budgets
router.post('/', createBudget);

// GET /api/budgets/status
router.get('/status', getBudgetStatus);

// PUT /api/budgets/:id
router.put('/:id', updateBudget);

// DELETE /api/budgets/:id
router.delete('/:id', deleteBudget);

export default router;
