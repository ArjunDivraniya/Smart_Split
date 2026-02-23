import { apiService } from '@/src/services/api';

const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Food & Dining', icon: 'restaurant', color: '#FF5F7E', enabled: true, isCustom: false },
  { id: '2', name: 'Transportation', icon: 'car', color: '#FFB547', enabled: true, isCustom: false },
  { id: '3', name: 'Entertainment', icon: 'play-circle', color: '#7C5CFC', enabled: true, isCustom: false },
  { id: '4', name: 'Shopping', icon: 'bag', color: '#00E5B0', enabled: true, isCustom: false },
  { id: '5', name: 'Bills & Utilities', icon: 'flash', color: '#FFB547', enabled: true, isCustom: false },
  { id: '6', name: 'Healthcare', icon: 'medkit', color: '#FF5F7E', enabled: true, isCustom: false },
  { id: '7', name: 'Education', icon: 'school', color: '#9B7FFF', enabled: true, isCustom: false },
  { id: '8', name: 'Travel', icon: 'airplane', color: '#00E5B0', enabled: true, isCustom: false },
  { id: '9', name: 'Subscriptions', icon: 'refresh', color: '#7C5CFC', enabled: true, isCustom: false },
  { id: '10', name: 'Others', icon: 'ellipsis-horizontal', color: '#55556A', enabled: true, isCustom: false },
];

// Initialize user preferences (called after login)
export const initializeUserPreferences = async () => {
  try {
    const userResponse = await apiService.user.getMe();
    
    if (!userResponse.data?.success) {
      return;
    }

    const user = userResponse.data.data;

    // Initialize categories if not already set
    if (!user.expenseCategories || user.expenseCategories.length === 0) {
      try {
        await apiService.profile.updateCategories(DEFAULT_CATEGORIES);
      } catch (error) {
        console.log('Failed to initialize categories on server');
      }
    }

    // Initialize privacy settings if not already set
    if (!user.privacySettings) {
      try {
        const defaultPrivacy = {
          privacyMode: false,
          hideBalances: false,
          hideExpenses: false,
          hideTransactions: false,
          dataCollection: true,
          analytics: true,
          marketingEmails: false,
        };
        await apiService.profile.updatePrivacySettings(defaultPrivacy);
      } catch (error) {
        console.log('Failed to initialize privacy settings on server');
      }
    }

    // Initialize security settings if not already set
    if (!user.securitySettings) {
      try {
        const defaultSecurity = {
          appLockEnabled: false,
          fingerprintEnabled: false,
          faceRecognitionEnabled: false,
        };
        await apiService.profile.updateSecuritySettings(defaultSecurity);
      } catch (error) {
        console.log('Failed to initialize security settings on server');
      }
    }

    // Initialize payment preferences if not already set
    if (!user.paymentPreferences) {
      try {
        const defaultPayment = {
          paymentPreferences: {
            upiId: '',
            bankAccount: '',
            autoPay: false,
          },
        };
        await apiService.profile.updatePaymentPreferences(defaultPayment);
      } catch (error) {
        console.log('Failed to initialize payment preferences on server');
      }
    }
  } catch (error) {
    console.error('Error initializing user preferences:', error);
  }
};

// Get default categories
export const getDefaultCategories = () => DEFAULT_CATEGORIES;

// Add custom category
export const addCustomCategory = (name: string, icon: string, color: string) => {
  const newCategory = {
    id: Date.now().toString(),
    name,
    icon,
    color,
    enabled: true,
    isCustom: true,
  };
  return newCategory;
};
