import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Text as SvgText } from 'react-native-svg';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const AmountInput: React.FC<AmountInputProps> = ({ value, onChange, error }) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors.dark; // Force dark theme for consistency
  const [displayValue, setDisplayValue] = useState(value || '0');
  const [cursorVisible, setCursorVisible] = useState(true);

  const MAX_AMOUNT = 99999;

  const sanitizeInput = (raw: string): string => {
    let cleaned = raw.replace(/[^0-9.]/g, '');

    if (cleaned.startsWith('.')) {
      cleaned = `0${cleaned}`;
    }

    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
    }

    if (cleaned.includes('.')) {
      const [whole, decimal = ''] = cleaned.split('.');
      cleaned = `${whole}.${decimal.slice(0, 2)}`;
    }

    const [whole = '', decimal] = cleaned.split('.');
    const normalizedWhole = whole.length > 1 ? whole.replace(/^0+/, '') || '0' : whole;
    const normalized = decimal !== undefined ? `${normalizedWhole}.${decimal}` : normalizedWhole;

    const numeric = parseFloat(normalized);
    if (!Number.isNaN(numeric) && numeric > MAX_AMOUNT) {
      return String(MAX_AMOUNT);
    }

    return normalized;
  };

  useEffect(() => {
    setDisplayValue(sanitizeInput(value || '0') || '0');
  }, [value]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);

    return () => clearInterval(timer);
  }, []);

  const pushValue = (nextRaw: string) => {
    const sanitized = sanitizeInput(nextRaw);
    setDisplayValue(sanitized || '0');
    onChange(sanitized || '0');
  };

  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      const trimmed = displayValue.length > 1 ? displayValue.slice(0, -1) : '0';
      pushValue(trimmed);
      return;
    }

    if (key === '.') {
      if (displayValue.includes('.')) {
        return;
      }
      const base = displayValue === '0' ? '0' : displayValue;
      pushValue(`${base}.`);
      return;
    }

    const digit = key;
    const base = displayValue === '0' ? '' : displayValue;
    pushValue(`${base}${digit}`);
  };

  const formatDisplay = (val: string): string => {
    if (!val || val === '0') return '0.00';
    
    const num = parseFloat(val);
    if (isNaN(num)) return '0.00';

    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const numericValue = parseFloat(displayValue) || 0;
  const displayText = useMemo(() => {
    if (!displayValue || displayValue === '0') {
      return '0';
    }
    return displayValue;
  }, [displayValue]);

  const amountWidth = Math.max(120, Math.min(320, displayText.length * 28 + 24));

  const keypadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'backspace'],
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
      <View style={styles.amountRow}>
        <Text style={[styles.currencySymbol, { color: colors.icon }]}>₹</Text>
        <View style={styles.amountDisplayWrap}>
          <Svg width={amountWidth} height={62} viewBox={`0 0 ${amountWidth} 62`}>
            <Defs>
              <SvgLinearGradient id="amountGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="#A78BFA" />
                <Stop offset="55%" stopColor="#8B5CF6" />
                <Stop offset="100%" stopColor="#6366F1" />
              </SvgLinearGradient>
            </Defs>
            <SvgText
              x={amountWidth / 2}
              y={48}
              fill="url(#amountGrad)"
              fontSize={44}
              fontWeight="800"
              fontFamily="Syne"
              textAnchor="middle"
            >
              {displayText}
            </SvgText>
          </Svg>
          <Text style={[styles.cursor, { opacity: cursorVisible ? 1 : 0, color: colors.text }]}>|</Text>
        </View>
      </View>

      <Text style={[styles.formattedAmount, { color: colors.icon }]}> 
        {numericValue > 0 ? `₹ ${formatDisplay(displayValue)}` : 'Enter amount'}
      </Text>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.keypadWrap}>
        {keypadRows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.keypadRow}>
            {row.map((key) => {
              const isBackspace = key === 'backspace';
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.keypadKey, { backgroundColor: colors.elevated }]}
                  onPress={() => handleKeyPress(key)}
                  activeOpacity={0.85}
                >
                  {isBackspace ? (
                    <Ionicons name="backspace-outline" size={22} color={colors.text} />
                  ) : (
                    <Text style={[styles.keypadText, { color: colors.text }]}>{key}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <Text style={[styles.maxHint, { color: colors.icon }]}>Max amount: ₹99,999</Text>

      <View style={styles.quickAmounts}>
        {[100, 500, 1000].map((amt) => (
          <TouchableOpacity
            key={amt}
            style={[styles.quickButton, { backgroundColor: colors.elevated }]}
            onPress={() => pushValue(String(Math.min(MAX_AMOUNT, (parseFloat(displayValue) || 0) + amt)))}
          >
            <Text style={[styles.quickButtonText, { color: colors.text }]}>+{amt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    padding: 24,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  amountDisplayWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 42,
    fontWeight: '700',
    marginRight: 8,
  },
  cursor: {
    fontSize: 40,
    fontWeight: '700',
    marginLeft: 2,
    marginTop: -4,
  },
  input: {
    fontSize: 56,
    fontWeight: '800',
    minWidth: 200,
    textAlign: 'center',
  },
  formattedAmount: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    marginLeft: 6,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  quickButton: {
    minWidth: 68,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  keypadWrap: {
    marginTop: 10,
    gap: 8,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 8,
  },
  keypadKey: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadText: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Syne',
  },
  maxHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
});
