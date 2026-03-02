import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const AmountInput: React.FC<AmountInputProps> = ({ value, onChange, error }) => {
  const [displayValue, setDisplayValue] = useState(value || '0');

  useEffect(() => {
    setDisplayValue(value || '0');
  }, [value]);

  const handleChange = (text: string) => {
    // Remove non-numeric characters except decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    let formatted = parts[0];
    if (parts.length > 1) {
      formatted += '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places
    if (formatted.includes('.')) {
      const [whole, decimal] = formatted.split('.');
      formatted = whole + '.' + decimal.slice(0, 2);
    }

    setDisplayValue(formatted);
    onChange(formatted);
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

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.currencySymbol}>₹</Text>
        <TextInput
          style={styles.input}
          value={displayValue}
          onChangeText={handleChange}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor="#94a3b8"
          autoFocus
          selectTextOnFocus
        />
      </View>
      
      <Text style={styles.formattedAmount}>
        {numericValue > 0 ? `₹ ${formatDisplay(displayValue)}` : 'Enter amount'}
      </Text>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Quick Amount Buttons */}
      <View style={styles.quickAmounts}>
        {[100, 500, 1000, 5000].map((amt) => (
          <TouchableOpacity
            key={amt}
            style={styles.quickButton}
            onPress={() => handleChange(amt.toString())}
          >
            <Text style={styles.quickButtonText}>+{amt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: '700',
    color: '#6366f1',
    marginRight: 8,
  },
  input: {
    fontSize: 56,
    fontWeight: '800',
    color: '#1e293b',
    minWidth: 200,
    textAlign: 'center',
  },
  formattedAmount: {
    fontSize: 18,
    color: '#64748b',
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
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    marginLeft: 6,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
});
