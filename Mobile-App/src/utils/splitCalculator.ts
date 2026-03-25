// Split calculation utilities for expense splitting

export type SplitType = 'equally' | 'unequally' | 'percentage' | 'shares';

export interface Participant {
  userId: string;
  userName: string;
  value?: number; // Used for percentage, exact amount, or shares
}

export interface SplitResult {
  userId: string;
  userName: string;
  amount: number;
  percentage: number;
}

/**
 * Calculate equal split among participants
 */
export const calculateEqualSplit = (
  amount: number,
  participants: Participant[]
): SplitResult[] => {
  if (participants.length === 0) return [];
  
  const shareAmount = amount / participants.length;
  const percentage = 100 / participants.length;

  return participants.map((p) => ({
    userId: p.userId,
    userName: p.userName,
    amount: shareAmount,
    percentage,
  }));
};

/**
 * Calculate percentage-based split
 * @returns Split results or null if percentages don't sum to 100
 */
export const calculatePercentageSplit = (
  amount: number,
  participants: Participant[]
): SplitResult[] | null => {
  const totalPercentage = participants.reduce((sum, p) => sum + (p.value || 0), 0);
  
  // Validate: must equal 100%
  if (Math.abs(totalPercentage - 100) > 0.01) {
    return null;
  }

  return participants.map((p) => ({
    userId: p.userId,
    userName: p.userName,
    amount: (amount * (p.value || 0)) / 100,
    percentage: p.value || 0,
  }));
};

/**
 * Calculate exact amount split
 * @returns Split results or null if amounts don't sum to total
 */
export const calculateExactSplit = (
  amount: number,
  participants: Participant[]
): SplitResult[] | null => {
  const totalAmount = participants.reduce((sum, p) => sum + (p.value || 0), 0);
  
  // Validate: must equal total amount
  if (Math.abs(totalAmount - amount) > 0.01) {
    return null;
  }

  return participants.map((p) => ({
    userId: p.userId,
    userName: p.userName,
    amount: p.value || 0,
    percentage: ((p.value || 0) / amount) * 100,
  }));
};

/**
 * Calculate shares-based split
 */
export const calculateSharesSplit = (
  amount: number,
  participants: Participant[]
): SplitResult[] => {
  const totalShares = participants.reduce((sum, p) => sum + (p.value || 0), 0);
  
  if (totalShares === 0) return [];

  return participants.map((p) => {
    const shares = p.value || 0;
    const shareAmount = (amount * shares) / totalShares;
    const percentage = (shares / totalShares) * 100;

    return {
      userId: p.userId,
      userName: p.userName,
      amount: shareAmount,
      percentage,
    };
  });
};

/**
 * Main split calculator - delegates to appropriate method
 */
export const calculateSplit = (
  splitType: SplitType,
  amount: number,
  participants: Participant[]
): SplitResult[] | null => {
  switch (splitType) {
    case 'equally':
      return calculateEqualSplit(amount, participants);
    case 'percentage':
      return calculatePercentageSplit(amount, participants);
    case 'unequally':
      return calculateExactSplit(amount, participants);
    case 'shares':
      return calculateSharesSplit(amount, participants);
    default:
      return null;
  }
};

/**
 * Validate split before submitting
 */
export const validateSplit = (
  splitType: SplitType,
  amount: number,
  participants: Participant[]
): { valid: boolean; error?: string } => {
  if (amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }

  if (participants.length === 0) {
    return { valid: false, error: 'At least one participant is required' };
  }

  switch (splitType) {
    case 'equally':
      return { valid: true };

    case 'percentage': {
      const total = participants.reduce((sum, p) => sum + (p.value || 0), 0);
      if (Math.abs(total - 100) > 0.01) {
        return { valid: false, error: `Percentages must sum to 100% (currently ${total.toFixed(1)}%)` };
      }
      return { valid: true };
    }

    case 'unequally': {
      const total = participants.reduce((sum, p) => sum + (p.value || 0), 0);
      if (Math.abs(total - amount) > 0.01) {
        return { valid: false, error: `Amounts must sum to ₹${amount} (currently ₹${total.toFixed(2)})` };
      }
      return { valid: true };
    }

    case 'shares': {
      const hasShares = participants.some((p) => (p.value || 0) > 0);
      if (!hasShares) {
        return { valid: false, error: 'At least one participant must have shares' };
      }
      return { valid: true };
    }

    default:
      return { valid: false, error: 'Invalid split type' };
  }
};

/**
 * Format amount with commas and 2 decimal places
 */
export const formatAmount = (amount: number): string => {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Get user's share info (useful for "You paid X, you get Y back" messages)
 */
export const getUserShareInfo = (
  currentUserId: string,
  paidByUserId: string,
  totalAmount: number,
  splitResults: SplitResult[]
): { paid: number; owes: number; getsBack: number; message: string } => {
  const currentUserSplit = splitResults.find((s) => s.userId === currentUserId);
  const userOwes = currentUserSplit?.amount || 0;
  const userPaid = paidByUserId === currentUserId ? totalAmount : 0;
  const getsBack = userPaid - userOwes;

  let message = '';
  if (paidByUserId === currentUserId) {
    if (getsBack > 0) {
      message = `You paid ₹${formatAmount(totalAmount)}. You get ₹${formatAmount(getsBack)} back.`;
    } else if (getsBack < 0) {
      message = `You paid ₹${formatAmount(totalAmount)}. You owe ₹${formatAmount(Math.abs(getsBack))} more.`;
    } else {
      message = `You paid ₹${formatAmount(totalAmount)}. You're all settled.`;
    }
  } else {
    message = `You owe ₹${formatAmount(userOwes)}.`;
  }

  return {
    paid: userPaid,
    owes: userOwes,
    getsBack,
    message,
  };
};
