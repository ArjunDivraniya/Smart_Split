import { Response } from 'express';
import Activity from '../models/Activity.model';
import Trip from '../models/Trip.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendNotification } from '../utils/notification';

// Get Itinerary (Activities)
export const getItinerary = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const activities = await Activity.find({ trip: id }).sort({ date: 1, time: 1 });

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error: any) {
    console.error('Get itinerary error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Add Activity to Itinerary
export const addActivity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const body = req.body;

    const activity = await Activity.create({
      trip: id,
      createdBy: userId,
      ...body,
    });

    const trip = await Trip.findById(id);
    if (trip) {
      const memberIds = trip.members
        .filter((m: any) => m.userId && m.userId.toString() !== userId)
        .map((m: any) => m.userId.toString());

      await sendNotification(memberIds, userId!, id, `Added activity: ${body.title}`, 'activity');
    }

    return res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (error: any) {
    console.error('Add activity error:', error);
    return res.status(500).json({ message: error.message });
  }
};
