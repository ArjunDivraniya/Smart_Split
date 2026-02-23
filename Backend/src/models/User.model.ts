import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  authProvider: 'credentials' | 'google';
  phone?: string;
  profileImage?: string;
  publicId?: string;
  qrCode?: string;
  qrPublicId?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
  },
  password: {
    type: String,
    required: false,
    default: null,
    select: false,
  },
  authProvider: {
    type: String,
    enum: ['credentials', 'google'],
    default: 'credentials',
  },
  phone: {
    type: String,
    default: '',
  },
  profileImage: {
    type: String,
    default: '',
  },
  publicId: {
    type: String,
    default: '',
  },
  qrCode: {
    type: String,
    default: '',
  },
  qrPublicId: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IUser>('User', UserSchema);
