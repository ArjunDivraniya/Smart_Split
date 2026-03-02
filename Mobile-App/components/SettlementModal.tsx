import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '@/src/services/api';

interface SettlementModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  fromUser: {
    id: string;
    name: string;
  };
  toUser: {
    id: string;
    name: string;
  };
  suggestedAmount: number;
  onSuccess: () => void;
}

export const SettlementModal: React.FC<SettlementModalProps> = ({
  visible,
  onClose,
  groupId,
  fromUser,
  toUser,
  suggestedAmount,
  onSuccess,
}) => {
  const [amount, setAmount] = useState(suggestedAmount.toFixed(2));
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (parsedAmount > suggestedAmount * 2) {
      Alert.alert(
        'Warning',
        'The amount is significantly higher than suggested. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => submitSettlement(parsedAmount) },
        ]
      );
      return;
    }

    submitSettlement(parsedAmount);
  };

  const submitSettlement = async (parsedAmount: number) => {
    try {
      setLoading(true);
      await apiService.groups.recordSettlement(groupId, {
        fromUserId: fromUser.id,
        toUserId: toUser.id,
        amount: parsedAmount,
        note: note.trim() || undefined,
      });

      Alert.alert('Success', 'Settlement recorded successfully', [
        {
          text: 'OK',
          onPress: () => {
            onSuccess();
            onClose();
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error recording settlement:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to record settlement'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setAmount(suggestedAmount.toFixed(2));
      setNote('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Record Settlement</Text>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <Ionicons name="close" size={28} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.flowContainer}>
              <View style={styles.userBubble}>
                <Text style={styles.userName}>{fromUser.name}</Text>
                <Text style={styles.userLabel}>Payer</Text>
              </View>
              
              <View style={styles.arrowContainer}>
                <Ionicons name="arrow-forward" size={32} color="#6366f1" />
              </View>
              
              <View style={styles.userBubble}>
                <Text style={styles.userName}>{toUser.name}</Text>
                <Text style={styles.userLabel}>Receiver</Text>
              </View>
            </View>

            <View style={styles.amountSection}>
              <Text style={styles.label}>Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                  editable={!loading}
                  selectTextOnFocus
                />
              </View>
              <Text style={styles.suggestedText}>
                Suggested: ₹{suggestedAmount.toFixed(2)}
              </Text>
            </View>

            <View style={styles.noteSection}>
              <Text style={styles.label}>Note (Optional)</Text>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="Add a note about this payment..."
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                  <Text style={styles.submitButtonText}>Record Payment</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  content: {
    padding: 20,
  },
  flowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  userBubble: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  userLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  arrowContainer: {
    marginHorizontal: 16,
  },
  amountSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366f1',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    paddingVertical: 12,
  },
  suggestedText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 8,
  },
  noteSection: {
    marginBottom: 16,
  },
  noteInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1e293b',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  submitButton: {
    backgroundColor: '#6366f1',
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
});
