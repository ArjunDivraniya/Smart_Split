import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  trip?: mongoose.Types.ObjectId;
  group?: mongoose.Types.ObjectId;
  message: string;
  type:
    | 'invite'
    | 'expense'
    | 'activity'
    | 'system'
    | 'settled'
    | 'expense_added'
    | 'budget_alert'
    | 'payment_reminder'
    | 'group_invite'
    | 'monthly_report'
    | 'payment_received'
    | 'payment_confirmed'
    | 'partial_payment'
    | 'mark_received';
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
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      'invite',
      'expense',
      'activity',
      'system',
      'settled',
      'expense_added',
      'budget_alert',
      'payment_reminder',
      'group_invite',
      'monthly_report',
      'payment_received',
      'payment_confirmed',
      'partial_payment',
      'mark_received',
    ],
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
