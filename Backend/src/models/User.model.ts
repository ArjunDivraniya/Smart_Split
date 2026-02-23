import mongoose, { Schema, Document } from 'mongoose';

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
  isCustom?: boolean;
}

export interface PaymentPreferences {
  upiId: string;
  bankAccount?: string;
  autoPay: boolean;
}

export interface PrivacySettings {
  privacyMode: boolean;
  hideBalances: boolean;
  hideExpenses: boolean;
  hideTransactions: boolean;
  dataCollection: boolean;
  analytics: boolean;
  marketingEmails: boolean;
}

export interface SecuritySettings {
  appLockEnabled: boolean;
  fingerprintEnabled: boolean;
  faceRecognitionEnabled: boolean;
  pinCode?: string; // This should be hashed
}

export interface IUserPreferences {
  theme: 'dark' | 'light' | 'system';
  monthlyIncome?: number;
  monthlyBudget?: number;
  savingsGoal?: number;
  defaultUpiId?: string;
  autoGenerateUpiLink: boolean;
  settlementConfirmation: boolean;
  currency: string;
  privacyMode: boolean;
  notifications: {
    groupExpenseAdded: boolean;
    personalExpenseReminder: boolean;
    settlementReminder: boolean;
    budgetAlert: boolean;
    weeklySummary: boolean;
  };
}

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
  upiId?: string;
  verified?: boolean;
  preferences: IUserPreferences;
  paymentPreferences: PaymentPreferences;
  expenseCategories: ExpenseCategory[];
  privacySettings: PrivacySettings;
  securitySettings: SecuritySettings;
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
  upiId: {
    type: String,
    default: '',
  },
  verified: {
    type: Boolean,
    default: false,
  },
  preferences: {
    theme: {
      type: String,
      enum: ['dark', 'light', 'system'],
      default: 'dark',
    },
    monthlyIncome: {
      type: Number,
      default: 0,
    },
    monthlyBudget: {
      type: Number,
      default: 0,
    },
    savingsGoal: {
      type: Number,
      default: 5000,
    },
    defaultUpiId: {
      type: String,
      default: '',
    },
    autoGenerateUpiLink: {
      type: Boolean,
      default: true,
    },
    settlementConfirmation: {
      type: Boolean,
      default: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    privacyMode: {
      type: Boolean,
      default: false,
    },
    notifications: {
      groupExpenseAdded: {
        type: Boolean,
        default: true,
      },
      personalExpenseReminder: {
        type: Boolean,
        default: true,
      },
      settlementReminder: {
        type: Boolean,
        default: true,
      },
      budgetAlert: {
        type: Boolean,
        default: true,
      },
      weeklySummary: {
        type: Boolean,
        default: false,
      },
    },
  },
  paymentPreferences: {
    upiId: {
      type: String,
      default: '',
    },
    bankAccount: {
      type: String,
      default: '',
    },
    autoPay: {
      type: Boolean,
      default: false,
    },
  },
  expenseCategories: [
    {
      id: String,
      name: String,
      icon: String,
      color: String,
      enabled: {
        type: Boolean,
        default: true,
      },
      isCustom: {
        type: Boolean,
        default: false,
      },
    },
  ],
  privacySettings: {
    privacyMode: {
      type: Boolean,
      default: false,
    },
    hideBalances: {
      type: Boolean,
      default: false,
    },
    hideExpenses: {
      type: Boolean,
      default: false,
    },
    hideTransactions: {
      type: Boolean,
      default: false,
    },
    dataCollection: {
      type: Boolean,
      default: true,
    },
    analytics: {
      type: Boolean,
      default: true,
    },
    marketingEmails: {
      type: Boolean,
      default: false,
    },
  },
  securitySettings: {
    appLockEnabled: {
      type: Boolean,
      default: false,
    },
    fingerprintEnabled: {
      type: Boolean,
      default: false,
    },
    faceRecognitionEnabled: {
      type: Boolean,
      default: false,
    },
    pinCode: {
      type: String,
      default: null,
      select: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IUser>('User', UserSchema);
