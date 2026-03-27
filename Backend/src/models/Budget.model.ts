import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
  user: mongoose.Types.ObjectId;
  category: string;
  limit: number;
  month: number;
  year: number;
  alertSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    limit: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 3000,
    },
    alertSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

BudgetSchema.index({ user: 1, month: 1, year: 1, category: 1 }, { unique: true });

export default mongoose.model<IBudget>('Budget', BudgetSchema);
