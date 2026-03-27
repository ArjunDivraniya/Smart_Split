import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Settlement } from '@/src/types/settlement.types';

type PaymentMethod = 'cash' | 'upi' | 'bank';

interface PartialPayModalProps {
  visible: boolean;
  onClose: () => void;
  settlement: Settlement | null;
  onConfirm: (data: { amountPaid: number; method: PaymentMethod; note?: string }) => Promise<void> | void;
}

const formatAmount = (value: number): string => `₹${Number(value || 0).toFixed(2)}`;

export function PartialPayModal({ visible, onClose, settlement, onConfirm }: PartialPayModalProps) {
  const [amountInput, setAmountInput] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setAmountInput('');
    setMethod('upi');
    setNote('');
    setSubmitting(false);
  }, [visible, settlement?.id]);

  const enteredAmount = useMemo(() => {
    const parsed = parseFloat(amountInput || '0');
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amountInput]);

  const remainingAfterPayment = useMemo(() => {
    const remaining = Number(settlement?.remaining || 0) - enteredAmount;
    return Number.isFinite(remaining) ? remaining : 0;
  }, [settlement?.remaining, enteredAmount]);

  const isExceeding = enteredAmount > Number(settlement?.remaining || 0);
  const isInvalidAmount = enteredAmount <= 0;
  const isInvalid = !settlement || isExceeding || isInvalidAmount || submitting;

  const remainingLabel = Math.max(0, remainingAfterPayment);

  const handleSelectQuickAmount = (value: number) => {
    setAmountInput(String(Number(value.toFixed(2))));
  };

  const handleConfirm = async () => {
    if (isInvalid || !settlement) {
      return;
    }

    try {
      setSubmitting(true);
      await onConfirm({
        amountPaid: Number(enteredAmount.toFixed(2)),
        method,
        note: note.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType='slide'
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheetCard}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Partial Payment</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name='close' size={22} color='#B5B5CE' />
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Paying: <Text style={styles.infoValue}>{settlement?.friend?.name || '-'}</Text></Text>
            <Text style={styles.infoText}>Total owed: <Text style={styles.infoValue}>{formatAmount(settlement?.amount || 0)}</Text></Text>
            <Text style={styles.infoText}>Already paid: <Text style={styles.infoValue}>{formatAmount(settlement?.amountPaid || 0)}</Text></Text>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Pay amount</Text>
            <TextInput
              value={amountInput}
              onChangeText={setAmountInput}
              keyboardType='numeric'
              placeholder='0.00'
              placeholderTextColor='#8F8FAB'
              style={styles.input}
            />

            <View style={styles.quickRow}>
              {[50, 100, 150].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={styles.quickPill}
                  onPress={() => handleSelectQuickAmount(value)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.quickText}>₹{value}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.quickPill}
                onPress={() => handleSelectQuickAmount(Number(settlement?.remaining || 0))}
                activeOpacity={0.9}
              >
                <Text style={styles.quickText}>₹{Number(settlement?.remaining || 0).toFixed(0)} (Full)</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Method</Text>
            <View style={styles.methodRow}>
              {(['cash', 'upi', 'bank'] as const).map((item) => {
                const selected = method === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.methodBtn, selected ? styles.methodBtnActive : null]}
                    onPress={() => setMethod(item)}
                    activeOpacity={0.9}
                  >
                    <Text style={[styles.methodText, selected ? styles.methodTextActive : null]}>
                      {item.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder='Add a note'
              placeholderTextColor='#8F8FAB'
              style={styles.input}
            />
          </View>

          <View style={styles.calcRow}>
            {remainingLabel <= 0 && enteredAmount > 0 && !isExceeding ? (
              <Text style={styles.settleText}>This will fully settle the debt ✅</Text>
            ) : (
              <Text style={styles.calcText}>Remaining after this payment: {formatAmount(remainingLabel)}</Text>
            )}

            {isExceeding ? (
              <Text style={styles.errorText}>
                Cannot exceed remaining balance of {formatAmount(settlement?.remaining || 0)}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.confirmOuter, isInvalid ? styles.confirmDisabled : null]}
            onPress={handleConfirm}
            disabled={isInvalid}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={isInvalid ? ['#5B5B74', '#4C4C66'] : ['#7C5CFC', '#6A48FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmGradient}
            >
              {submitting ? (
                <ActivityIndicator color='#FFFFFF' />
              ) : (
                <Text style={styles.confirmText}>Confirm Partial Payment</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default PartialPayModal;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  sheetCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#14141F',
    padding: 24,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: '#F3F3FF',
    fontSize: 22,
    fontFamily: 'Syne_700Bold',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: '#1A1A2B',
    padding: 12,
    gap: 4,
    marginBottom: 14,
  },
  infoText: {
    color: '#B6B6D1',
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
  },
  infoValue: {
    color: '#F3F3FF',
    fontFamily: 'DMSans_700Bold',
  },
  fieldWrap: {
    marginBottom: 12,
  },
  label: {
    color: '#B6B6D1',
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: '#10101A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#F3F3FF',
    fontFamily: 'DMSans_500Medium',
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  quickPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: '#1A1A2B',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  quickText: {
    color: '#D4D4EC',
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  methodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: '#10101A',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  methodBtnActive: {
    borderColor: '#00E5B0',
    backgroundColor: 'rgba(0,229,176,0.14)',
  },
  methodText: {
    color: '#B6B6D1',
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  methodTextActive: {
    color: '#00E5B0',
  },
  calcRow: {
    marginTop: 2,
    marginBottom: 12,
    gap: 4,
  },
  calcText: {
    color: '#B6B6D1',
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
  settleText: {
    color: '#00E5B0',
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  errorText: {
    color: '#FF5F7E',
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
  },
  confirmOuter: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmDisabled: {
    opacity: 0.76,
  },
  confirmGradient: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
  },
});
