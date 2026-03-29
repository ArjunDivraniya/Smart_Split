import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import User from '../models/User.model';
import Notification from '../models/Notification.model';

dotenv.config();

const run = async () => {
  await connectDB();

  const users = await User.find({}, '_id').lean();
  if (!users.length) {
    console.log('No users found. Skipping monthly report notifications.');
    await mongoose.connection.close();
    return;
  }

  const reportMonth = new Date().toLocaleString('en-US', { month: 'long' });
  const createdAt = new Date();

  const notifications = users.map((user: any) => ({
    recipient: user._id,
    message: `Your ${reportMonth} spending report is ready 📊`,
    type: 'monthly_report',
    isRead: false,
    createdAt,
  }));

  await Notification.insertMany(notifications);
  console.log(`Monthly reports sent: ${notifications.length}`);

  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error('Failed to send monthly report notifications:', error);
  try {
    await mongoose.connection.close();
  } catch {
    // Ignore close errors on failure path.
  }
  process.exit(1);
});
