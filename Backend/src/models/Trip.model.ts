import mongoose, { Schema, Document } from 'mongoose';

export interface ITripMember {
  email: string;
  userId?: mongoose.Types.ObjectId;
  status: 'invited' | 'joined' | 'rejected';
}

export interface ITrip extends Document {
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed';
  createdBy: mongoose.Types.ObjectId;
  members: ITripMember[];
  expenses: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const TripSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a trip name'],
    trim: true,
  },
  destination: {
    type: String,
    required: [true, 'Please provide a destination'],
    trim: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date'],
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [
    {
      email: { type: String, required: true },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: {
        type: String,
        enum: ['invited', 'joined', 'rejected'],
        default: 'invited',
      },
    },
  ],
  expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<ITrip>('Trip', TripSchema);
