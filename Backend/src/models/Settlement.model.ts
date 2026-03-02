import mongoose, { Document, Schema } from 'mongoose';

export interface ISettlement extends Document {
  group: mongoose.Types.ObjectId;
  fromUser: mongoose.Types.ObjectId;
  toUser: mongoose.Types.ObjectId;
  amount: number;
  note?: string;
  createdBy: mongoose.Types.ObjectId;
  status: 'completed' | 'reversed';
  createdAt: Date;
  updatedAt: Date;
}

const SettlementSchema: Schema = new Schema(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    fromUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      default: '',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['completed', 'reversed'],
      default: 'completed',
    },
  },
  { timestamps: true }
);

SettlementSchema.index({ group: 1, createdAt: -1 });

export default mongoose.model<ISettlement>('Settlement', SettlementSchema);
