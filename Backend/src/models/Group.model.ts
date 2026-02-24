import mongoose, { Schema, Document } from 'mongoose';

export interface IGroupMember extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  email: string;
  role: 'creator' | 'member';
  status?: 'invited' | 'joined' | 'rejected'; // For trip-type groups
}

export interface IGroup extends Document {
  name: string;
  type: 'personal' | 'trip' | 'college' | 'food' | 'flatmates' | 'event' | 'custom';
  emoji: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  members: IGroupMember[];
  expenses: mongoose.Types.ObjectId[];
  totalSpent: number;
  netBalance: number;
  isActive: boolean;
  status?: 'active' | 'completed'; // For trip-type groups
  
  // Trip-specific fields (optional, only for trip-type groups)
  tripStartDate?: Date;
  tripEndDate?: Date;
  tripDestination?: string;
  tripBudget?: number;
  trackBudget?: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['personal', 'trip', 'college', 'food', 'flatmates', 'event', 'custom'],
      required: true,
    },
    emoji: {
      type: String,
      default: '👥',
    },
    description: {
      type: String,
      default: '',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        userName: String,
        email: String,
        role: {
          type: String,
          enum: ['creator', 'member'],
          default: 'member',
        },
        status: {
          type: String,
          enum: ['invited', 'joined', 'rejected'],
          default: 'joined', // For non-trip groups, default to joined
        },
      },
    ],
    expenses: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Expense',
      },
    ],
    totalSpent: {
      type: Number,
      default: 0,
    },
    netBalance: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
    
    // Trip-specific fields
    tripStartDate: {
      type: Date,
      default: null,
    },
    tripEndDate: {
      type: Date,
      default: null,
    },
    tripDestination: {
      type: String,
      default: '',
    },
    tripBudget: {
      type: Number,
      default: null,
    },
    trackBudget: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for faster queries
GroupSchema.index({ createdBy: 1 });
GroupSchema.index({ 'members.userId': 1 });
GroupSchema.index({ type: 1 });

export default mongoose.model<IGroup>('Group', GroupSchema);
