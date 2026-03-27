import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getFriendBalances, getFriendHistory } from '../controllers/friends.controller';

const router = Router();

router.use(authenticateToken);

// GET /api/friends/balances
router.get('/balances', getFriendBalances);

// GET /api/friends/:id/history
router.get('/:id/history', getFriendHistory);

export default router;
