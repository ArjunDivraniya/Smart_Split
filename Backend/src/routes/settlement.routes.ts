import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getGroupSettlements, recordGroupSettlement } from '../controllers/group.controller';
import { recordSettlement } from '../controllers/settlement.controller';

const router = Router();

router.use(authenticateToken);

/**
 * @route GET /api/settlements/group/:id
 * @desc Get optimized settlements for group
 * @access Private
 */
router.get('/group/:id', getGroupSettlements);

/**
 * @route POST /api/settlements/group/:id
 * @desc Record completed settlement for group
 * @access Private
 */
router.post('/group/:id', recordGroupSettlement);

/**
 * @route POST /api/settlements
 * @desc Record a settlement payment (group-scoped or across groups)
 * @access Private
 */
router.post('/', recordSettlement);

export default router;
