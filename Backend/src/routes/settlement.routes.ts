import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { recordGroupSettlement } from '../controllers/group.controller';
import {
  getGroupSettlementHistory,
  getSettlementHistory,
  getPendingSettlements,
  getUserSettlements,
  markSettlementAsReceived,
  recordPartialSettlementPayment,
  recordSettlement,
  sendSettlementReminder,
} from '../controllers/settlement.controller';

const router = Router();

router.use(authenticateToken);

/**
 * @route GET /api/settlements/user
 * @desc Get all settlements involving current user (newest first)
 * @access Private
 */
router.get('/user', getUserSettlements);

/**
 * @route GET /api/settlements/pending
 * @desc Get pending/overdue/partial settlements for current user
 * @access Private
 */
router.get('/pending', getPendingSettlements);

/**
 * @route GET /api/settlements/history
 * @desc Get completed settlement history for current user with pagination and filtering
 * @access Private
 */
router.get('/history', getSettlementHistory);

/**
 * @route POST /api/settlements/remind
 * @desc Send a settlement reminder to payer (24h cooldown)
 * @access Private
 */
router.post('/remind', sendSettlementReminder);

/**
 * @route PUT /api/settlements/:id/partial
 * @desc Record a partial payment against an existing settlement
 * @access Private
 */
router.put('/:id/partial', recordPartialSettlementPayment);

/**
 * @route PUT /api/settlements/:id/mark-received
 * @desc Receiver confirms payment is fully received
 * @access Private
 */
router.put('/:id/mark-received', markSettlementAsReceived);

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
