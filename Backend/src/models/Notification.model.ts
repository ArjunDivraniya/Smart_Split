import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  trip?: mongoose.Types.ObjectId;
  message: string;
  type: 'invite' | 'expense' | 'activity' | 'system' | 'settled' | 'expense_added' | 'budget_alert';
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['invite', 'expense', 'activity', 'system', 'settled', 'expense_added', 'budget_alert'],
    default: 'system',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<INotification>('Notification', NotificationSchema);
