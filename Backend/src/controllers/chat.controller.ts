import { Response } from 'express';
import Message from '../models/Message.model';
import { AuthRequest } from '../middleware/auth.middleware';

// Get Chat Messages
export const getChatMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const messages = await Message.find({ trip: id })
      .sort({ createdAt: 1 })
      .populate('sender', 'name profileImage');

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    console.error('Get chat messages error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Send Chat Message
export const sendChatMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { content } = req.body;

    const newMessage = await Message.create({
      trip: id,
      sender: userId,
      content,
    });

    const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name profileImage');

    return res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error: any) {
    console.error('Send chat message error:', error);
    return res.status(500).json({ message: error.message });
  }
};
