import Notification from '../models/Notification.model';

export async function sendNotification(
  recipients: string[],
  senderId: string,
  contextId: string,
  message: string,
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
    | 'mark_received',
  isTrip: boolean = true
) {
  try {
    // Filter out the sender so they don't notify themselves
    const targets = recipients.filter((id) => id.toString() !== senderId.toString());

    if (targets.length === 0) return;

    const notifications = targets.map((recipientId) => ({
      recipient: recipientId,
      sender: senderId,
      [isTrip ? 'trip' : 'group']: contextId,
      message,
      type,
      isRead: false,
      createdAt: new Date(),
    }));

    await Notification.insertMany(notifications);
    console.log(`✓ Sent ${notifications.length} notifications`);
  } catch (error) {
    console.error('Failed to send notifications:', error);
  }
}
