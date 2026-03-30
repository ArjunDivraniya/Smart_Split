import React, { useEffect, useState } from 'react';
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
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const [amount, setAmount] = useState(suggestedAmount.toFixed(2));
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setAmount(suggestedAmount.toFixed(2));
      setNote('');
    }
  }, [visible, suggestedAmount]);

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
        
        <View style={[styles.container, { backgroundColor: colors.elevated }]}>
          <View style={[styles.header, { borderBottomColor: `${colors.violet}15` }]}>
            <View style={styles.headerIconTitle}>
              <View style={[styles.headerIconWrap, { backgroundColor: `${colors.violet}15` }]}>
                <Ionicons name="wallet-outline" size={20} color={colors.violet} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Record Settlement</Text>
            </View>
            <TouchableOpacity onPress={handleClose} disabled={loading} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.icon} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.flowContainer}>
              <View style={[styles.userBubble, { backgroundColor: `${colors.violet}08`, borderColor: `${colors.violet}15` }]}>
                <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                  {fromUser.name}
                </Text>
                <Text style={[styles.userLabel, { color: colors.icon }]}>Payer</Text>
              </View>
              
              <View style={styles.arrowContainer}>
                <Ionicons name="arrow-forward" size={24} color={colors.violet} />
              </View>
              
              <View style={[styles.userBubble, { backgroundColor: `${colors.violet}08`, borderColor: `${colors.violet}15` }]}>
                <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                  {toUser.name}
                </Text>
                <Text style={[styles.userLabel, { color: colors.icon }]}>Receiver</Text>
              </View>
            </View>

            <View style={styles.amountSection}>
              <Text style={[styles.inputLabel, { color: colors.icon }]}>Enter Amount</Text>
              <View style={[styles.amountInputContainer, { backgroundColor: `${colors.violet}05`, borderColor: `${colors.violet}20` }]}>
                <Text style={[styles.currencySymbol, { color: colors.violet }]}>₹</Text>
                <TextInput
                  style={[styles.amountInput, { color: colors.text }]}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={colors.tabIconDefault}
                  editable={!loading}
                  selectTextOnFocus
                />
              </View>
              <View style={styles.suggestedBadge}>
                <Ionicons name="bulb-outline" size={12} color={colors.amber} />
                <Text style={[styles.suggestedText, { color: colors.amber }]}>
                  Suggested: ₹{suggestedAmount.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.noteSection}>
              <Text style={[styles.inputLabel, { color: colors.icon }]}>Note (Optional)</Text>
              <TextInput
                style={[styles.noteInput, { backgroundColor: `${colors.violet}05`, borderColor: `${colors.violet}20`, color: colors.text }]}
                value={note}
                onChangeText={setNote}
                placeholder="What was this for?"
                placeholderTextColor={colors.tabIconDefault}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.btn, styles.cancelBtn, { borderColor: `${colors.violet}20` }]}
              onPress={handleClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelBtnText, { color: colors.icon }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.btn, styles.submitBtn, { backgroundColor: colors.violet }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.violet, '#9B7FFF']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
                  <Text style={styles.submitBtnText}>Record Payment</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Mock LinearGradient if expo-linear-gradient is not available in components directory context
// (In a real app, you'd just import it from expo-linear-gradient)
import { LinearGradient } from 'expo-linear-gradient';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  container: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 24,
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
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    marginBottom: 4,
  },
  userLabel: {
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  arrowContainer: {
    paddingHorizontal: 12,
  },
  amountSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: 'DMSans_700Bold',
    marginBottom: 10,
    marginLeft: 4,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 72,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    paddingVertical: 0, // fix for some android text centers
  },
  suggestedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    marginLeft: 4,
  },
  suggestedText: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
  noteSection: {
    marginBottom: 12,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
  submitBtn: {
    // shadow applied via container or gradient
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    color: '#ffffff',
  },
});
