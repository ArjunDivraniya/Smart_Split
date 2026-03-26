// Pure split calculation utilities (no UI / no API calls)

export type SplitType = 'equally' | 'unequally' | 'percentage' | 'shares';

export interface Participant {
  userId: string;
  userName: string;
  value?: number; // percentage, exact amount, or shares based on split type
}

export interface SplitResult {
  userId: string;
  userName: string;
  amount: number;
  percentage: number;
}

const roundTo2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

const sum = (values: number[]): number => values.reduce((acc, v) => acc + v, 0);

/**
 * calculateEqualSplit(amount, memberCount)
 * Example: 100 split in 3 => [33, 33, 34]
 */
export const calculateEqualSplit = (amount: number, memberCount: number): number[] => {
  if (amount <= 0 || memberCount <= 0) {
    throw new Error('Amount and memberCount must be greater than 0');
  }

  // Use integer paise to avoid floating precision drift.
  const totalPaise = Math.round(amount * 100);
  const basePaise = Math.floor(totalPaise / memberCount);
  const remainderPaise = totalPaise - basePaise * memberCount;

  const parts = Array.from({ length: memberCount }, () => basePaise);
  // Per requirement, last member gets remainder.
  parts[memberCount - 1] += remainderPaise;

  return parts.map((paise) => paise / 100);
};

/**
 * calculatePercentageSplit(amount, percentages[])
 * Validates percentages sum to 100.
 */
export const calculatePercentageSplit = (amount: number, percentages: number[]): number[] => {
  if (amount < 0) {
    throw new Error('Amount cannot be negative');
  }
  if (!percentages.length) {
    throw new Error('Percentages are required');
  }
  if (percentages.some((p) => p < 0)) {
    throw new Error('Percentages cannot be negative');
  }

  const totalPercentage = roundTo2(sum(percentages));
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error(`Percentages must sum to 100 (currently ${totalPercentage})`);
  }

  const results = percentages.map((p) => roundTo2((amount * p) / 100));
  // Keep total exact by adjusting final member with remainder.
  const running = roundTo2(sum(results.slice(0, -1)));
  results[results.length - 1] = roundTo2(amount - running);

  return results;
};

/**
 * calculateExactSplit(members[], amounts[])
 * Validates shape and (optionally) validates sum equals provided total amount.
 */
export const calculateExactSplit = (
  members: Array<string | Participant>,
  amounts: number[],
  totalAmount?: number
): number[] => {
  if (!members.length) {
    throw new Error('Members are required');
  }
  if (members.length !== amounts.length) {
    throw new Error('Members and amounts length must match');
  }
  if (amounts.some((a) => a < 0)) {
    throw new Error('Amounts cannot be negative');
  }

  const normalized = amounts.map((a) => roundTo2(a));

  if (typeof totalAmount === 'number') {
    const computed = roundTo2(sum(normalized));
    const expected = roundTo2(totalAmount);
    if (Math.abs(computed - expected) > 0.01) {
      throw new Error(`Exact amounts must sum to ${expected} (currently ${computed})`);
    }
  }

  return normalized;
};

/**
 * calculateSharesSplit(amount, shares[])
 * Proportional split based on share units.
 */
export const calculateSharesSplit = (amount: number, shares: number[]): number[] => {
  if (amount < 0) {
    throw new Error('Amount cannot be negative');
  }
  if (!shares.length) {
    throw new Error('Shares are required');
  }
  if (shares.some((s) => s < 0)) {
    throw new Error('Shares cannot be negative');
  }

  const totalShares = sum(shares);
  if (totalShares <= 0) {
    throw new Error('At least one share must be greater than 0');
  }

  const results = shares.map((s) => roundTo2((amount * s) / totalShares));
  const running = roundTo2(sum(results.slice(0, -1)));
  results[results.length - 1] = roundTo2(amount - running);

  return results;
};

/**
 * Compatibility wrapper used by Add Expense screen.
 */
export const calculateSplit = (
  splitType: SplitType,
  amount: number,
  participants: Participant[]
): SplitResult[] => {
  if (!participants.length) {
    return [];
  }

  let amounts: number[] = [];

  switch (splitType) {
    case 'equally':
      amounts = calculateEqualSplit(amount, participants.length);
      break;
    case 'percentage':
      amounts = calculatePercentageSplit(
        amount,
        participants.map((p) => Number(p.value || 0))
      );
      break;
    case 'unequally':
      amounts = calculateExactSplit(
        participants,
        participants.map((p) => Number(p.value || 0)),
        amount
      );
      break;
    case 'shares':
      amounts = calculateSharesSplit(
        amount,
        participants.map((p) => Number(p.value || 0))
      );
      break;
    default:
      amounts = [];
  }

  return participants.map((participant, index) => {
    const memberAmount = roundTo2(amounts[index] || 0);
    const percentage = amount > 0 ? roundTo2((memberAmount / amount) * 100) : 0;

    return {
      userId: participant.userId,
      userName: participant.userName,
      amount: memberAmount,
      percentage,
    };
  });
};

export const validateSplit = (
  splitType: SplitType,
  amount: number,
  participants: Participant[]
): { valid: boolean; error?: string } => {
  if (amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }

  if (!participants.length) {
    return { valid: false, error: 'At least one participant is required' };
  }

  try {
    switch (splitType) {
      case 'equally':
        calculateEqualSplit(amount, participants.length);
        return { valid: true };
      case 'percentage':
        calculatePercentageSplit(
          amount,
          participants.map((p) => Number(p.value || 0))
        );
        return { valid: true };
      case 'unequally':
        calculateExactSplit(
          participants,
          participants.map((p) => Number(p.value || 0)),
          amount
        );
        return { valid: true };
      case 'shares':
        calculateSharesSplit(
          amount,
          participants.map((p) => Number(p.value || 0))
        );
        return { valid: true };
      default:
        return { valid: false, error: 'Invalid split type' };
    }
  } catch (error: any) {
    return { valid: false, error: error?.message || 'Invalid split values' };
  }
};

export const formatAmount = (amount: number): string => {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

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
