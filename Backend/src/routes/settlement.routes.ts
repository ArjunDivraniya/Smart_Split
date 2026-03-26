import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { recordGroupSettlement } from '../controllers/group.controller';
import { getGroupSettlementHistory, getUserSettlements, recordSettlement } from '../controllers/settlement.controller';

const router = Router();

router.use(authenticateToken);

/**
 * @route GET /api/settlements/user
 * @desc Get all settlements involving current user (newest first)
 * @access Private
 */
router.get('/user', getUserSettlements);

/**
 * @route GET /api/settlements/group/:groupId
 * @desc Get settlement history for a group (newest first)
 * @access Private
 */
router.get('/group/:groupId', getGroupSettlementHistory);

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
