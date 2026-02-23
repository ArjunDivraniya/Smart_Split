import { Response } from 'express';
import User from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    return res.status(400).json({ message: error.message });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, phone },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated',
      data: updatedUser,
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || (query as string).length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Search by name OR email (case-insensitive)
    const users = await User.find({
      $or: [
        { name: { $regex: query as string, $options: 'i' } },
        { email: { $regex: query as string, $options: 'i' } },
      ],
    })
      .select('name email profileImage _id')
      .limit(5);

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error('Search users error:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const uploadProfileImage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old image if exists
    if (user.publicId) {
      await deleteFromCloudinary(user.publicId);
    }

    // Upload new image
    const result: any = await uploadToCloudinary(file, 'trip-splitter-profiles');

    user.profileImage = result.secure_url;
    user.publicId = result.public_id;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Image uploaded',
      data: user,
    });
  } catch (error: any) {
    console.error('Upload profile image error:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const uploadQRCode = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old QR if exists
    if (user.qrPublicId) {
      await deleteFromCloudinary(user.qrPublicId);
    }

    // Upload new QR code
    const result: any = await uploadToCloudinary(file, 'trip-splitter-qrcodes');

    user.qrCode = result.secure_url;
    user.qrPublicId = result.public_id;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'QR Code uploaded',
      data: user,
    });
  } catch (error: any) {
    console.error('Upload QR code error:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete images from Cloudinary
    if (user.publicId) {
      await deleteFromCloudinary(user.publicId);
    }
    if (user.qrPublicId) {
      await deleteFromCloudinary(user.qrPublicId);
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return res.status(500).json({ message: error.message });
  }
};
