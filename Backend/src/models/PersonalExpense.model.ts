import mongoose, { Document, Schema } from 'mongoose';

export interface IPersonalExpense extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  description: string;
  category: string;
  paymentMethod: string;
  expenseDate: Date;
  isRecurring: boolean;
  recurringType: 'daily' | 'monthly' | 'weekly' | null;
  note?: string;
  receiptUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const PersonalExpenseSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
      maxlength: 64,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'],
    },
    expenseDate: {
      type: Date,
      required: true,
      index: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringType: {
      type: String,
      enum: ['daily', 'monthly', 'weekly'],
      default: null,
      nullable: true,
    },
    note: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    receiptUrl: {
      type: String,
      default: null,
      nullable: true,
    },
  },
  {
    timestamps: true,
  }
);

PersonalExpenseSchema.index({ user: 1, expenseDate: -1 });
PersonalExpenseSchema.index({ user: 1, category: 1, expenseDate: -1 });

export default mongoose.model<IPersonalExpense>('PersonalExpense', PersonalExpenseSchema);



