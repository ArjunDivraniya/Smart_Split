import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  title: string;
  amount: number;
  category: string;
  paidBy: mongoose.Types.ObjectId;
  trip: mongoose.Types.ObjectId;
  splitBetween: mongoose.Types.ObjectId[];
  splitType: 'equally' | 'unequally' | 'percentage' | 'shares';
  splitAmounts: Map<string, number>;
  splitPercentages: Map<string, number>;
  splitShares: Map<string, number>;
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
    required: true,
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
});

export default mongoose.model<IExpense>('Expense', ExpenseSchema);
