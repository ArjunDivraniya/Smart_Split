import { Router } from 'express';
import {
  getCurrentUser,
  updateUser,
  searchUsers,
  uploadProfileImage,
  uploadQRCode,
  deleteAccount,
} from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/user/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', getCurrentUser);

/**
 * @route   PUT /api/user/update
 * @desc    Update user profile
 * @access  Private
 */
router.put('/update', updateUser);

/**
 * @route   GET /api/user/search
 * @desc    Search users by name or email
 * @access  Private
 */
router.get('/search', searchUsers);

/**
 * @route   POST /api/user/upload-profile
 * @desc    Upload profile image
 * @access  Private
 */
router.post('/upload-profile', upload.single('file'), uploadProfileImage);

/**
 * @route   POST /api/user/upload-qr
 * @desc    Upload QR code
 * @access  Private
 */
router.post('/upload-qr', upload.single('file'), uploadQRCode);

/**
 * @route   DELETE /api/user/delete-account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/delete-account', deleteAccount);

export default router;
