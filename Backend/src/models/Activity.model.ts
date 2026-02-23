import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  trip: mongoose.Types.ObjectId;
  title: string;
  date: Date;
  time?: string;
  location?: string;
  notes?: string;
  createdBy?: mongoose.Types.ObjectId;
}

const ActivitySchema: Schema = new Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
  },
  location: {
    type: String,
  },
  notes: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

export default mongoose.model<IActivity>('Activity', ActivitySchema);
