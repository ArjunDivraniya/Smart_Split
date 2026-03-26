import mongoose, { Document, Schema } from 'mongoose';

export interface ISettlement extends Document {
  group?: mongoose.Types.ObjectId;
  fromUser: mongoose.Types.ObjectId;
  toUser: mongoose.Types.ObjectId;
  amount: number;
  type: 'full' | 'partial';
  amountPaid: number;
  remaining: number;
  dueDate?: Date;
  remindedAt?: Date;
  remindCount: number;
  source: 'group' | 'personal' | 'direct';
  method: 'cash' | 'upi' | 'bank';
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
      required: false,
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
    type: {
      type: String,
      enum: ['full', 'partial'],
      default: 'full',
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    remaining: {
      type: Number,
      default: 0,
    },
    dueDate: {
      type: Date,
      required: false,
    },
    remindedAt: {
      type: Date,
      required: false,
    },
    remindCount: {
      type: Number,
      default: 0,
    },
    source: {
      type: String,
      enum: ['group', 'personal', 'direct'],
      default: 'group',
    },
    method: {
      type: String,
      enum: ['cash', 'upi', 'bank'],
      default: 'cash',
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

SettlementSchema.pre('save', function () {
  const settlement = this as unknown as ISettlement;
  settlement.remaining = Number(settlement.amount || 0) - Number(settlement.amountPaid || 0);

  if (settlement.remaining <= 0) {
    settlement.status = 'completed';
  }
});

SettlementSchema.index({ group: 1, createdAt: -1 });

export default mongoose.model<ISettlement>('Settlement', SettlementSchema);
