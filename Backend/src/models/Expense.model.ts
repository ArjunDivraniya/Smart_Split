import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  title: string;
  amount: number;
  category: string;
  paidBy: mongoose.Types.ObjectId;
  trip?: mongoose.Types.ObjectId;
  group?: mongoose.Types.ObjectId;
  splitBetween: mongoose.Types.ObjectId[];
  splitType: 'equally' | 'unequally' | 'percentage' | 'shares';
  splitAmounts: Map<string, number>;
  splitPercentages: Map<string, number>;
  splitShares: Map<string, number>;
  receiptUrl?: string;
  notes?: string;
  date: Date;
}

const ExpenseSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Please provide an expense title'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
  },
  category: {
    type: String,
    required: true,
    default: 'other',
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: false,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: false,
  },
  splitBetween: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  splitType: {
    type: String,
    enum: ['equally', 'unequally', 'percentage', 'shares'],
    default: 'equally',
  },
  splitAmounts: {
    type: Map,
    of: Number,
    default: {},
  },
  splitPercentages: {
    type: Map,
    of: Number,
    default: {},
  },
  splitShares: {
    type: Map,
    of: Number,
    default: {},
  },
  date: {
    type: Date,
    default: Date.now,
  },
  receiptUrl: {
    type: String,
    required: false,
  },
  notes: {
    type: String,
    required: false,
    default: '',
  },
});

ExpenseSchema.index({ group: 1, date: -1 });
ExpenseSchema.index({ trip: 1, date: -1 });

export default mongoose.model<IExpense>('Expense', ExpenseSchema);
