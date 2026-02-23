import mongoose, { Schema, Document } from 'mongoose';

export interface IPackingItem extends Document {
  trip: mongoose.Types.ObjectId;
  text: string;
  category: string;
  isChecked: boolean;
  addedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PackingItemSchema: Schema = new Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    default: 'Other',
  },
  isChecked: {
    type: Boolean,
    default: false,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IPackingItem>('PackingItem', PackingItemSchema);
