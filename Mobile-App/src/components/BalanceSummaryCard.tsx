import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getCurrencySymbol, getPreferredCurrency } from '@/src/utils/currency';

interface BalanceSummaryCardProps {
  label: string;
  amount: number;
  type: 'owe' | 'get';
}

const COLORS = {
  coral: '#FF5F7E',
  coralDim: 'rgba(255, 95, 126, 0.2)',
  coralBorder: 'rgba(255, 95, 126, 0.2)',
  mint: '#00E5B0',
  mintDim: 'rgba(0, 229, 176, 0.2)',
  mintBorder: 'rgba(0, 229, 176, 0.2)',
  textMuted: '#55556A',
};

export const BalanceSummaryCard: React.FC<BalanceSummaryCardProps> = ({
  label,
  amount,
  type,
}) => {
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  useEffect(() => {
    const loadCurrency = async () => {
      const code = await getPreferredCurrency();
      setCurrencySymbol(getCurrencySymbol(code));
    };
    loadCurrency();
  }, []);

  const isOwe = type === 'owe';
  const backgroundColor: [string, string] = isOwe
    ? [COLORS.coralDim, 'rgba(255, 95, 126, 0.05)']
    : [COLORS.mintDim, 'rgba(0, 229, 176, 0.05)'];
  const borderColor = isOwe ? COLORS.coralBorder : COLORS.mintBorder;
  const amountColor = isOwe ? COLORS.coral : COLORS.mint;

  return (
    <LinearGradient
      colors={backgroundColor}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { borderColor }]}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.amount, { color: amountColor }]}>
        {currencySymbol}{amount.toLocaleString('en-IN')}
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  label: {
    fontSize: 9,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: 'DMSans_600SemiBold',
    marginBottom: 2,
  },
  amount: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    marginTop: 2,
  },
});
