import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { addExpense, updateExpense } from '@/src/services/personal.service';
import type { ExpenseCategory, PaymentMethod, RecurringType } from '@/src/types/personal.types';
import { hapticImpactLight } from '@/src/utils/haptics';
import { showSuccessToast } from '@/src/utils/toast';

const COLORS = {
  surface: '#0F0F1A',
  elevated: '#171727',
  input: '#1A1A2B',
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  border: 'rgba(255,255,255,0.08)',
  violet: '#7C5CFC',
  mint: '#00E5B0',
  amber: '#FFB547',
  coral: '#FF5F7E',
};

const CATEGORY_OPTIONS: Array<{ key: ExpenseCategory; label: string; emoji: string }> = [
  { key: 'Food', label: 'Food', emoji: '🍔' },
  { key: 'Transport', label: 'Transport', emoji: '🚕' },
  { key: 'Entertainment', label: 'Fun', emoji: '🎬' },
  { key: 'Shopping', label: 'Shopping', emoji: '🛍️' },
  { key: 'Custom', label: 'Custom', emoji: '✍️' },
];

const PAYMENT_OPTIONS: PaymentMethod[] = ['Cash', 'UPI', 'Card'];

const formatINR = (raw: string): string => {
  const clean = raw.replace(/[^0-9.]/g, '');
  if (!clean) {
    return '';
  }

  const [whole, decimal] = clean.split('.');
  const normalizedWhole = whole.replace(/^0+(?=\d)/, '') || '0';
  const localized = Number(normalizedWhole || '0').toLocaleString('en-IN');
  if (decimal !== undefined) {
    return `${localized}.${decimal.slice(0, 2)}`;
  }
  return localized;
};

const parseAmount = (formatted: string): number => {
  const numeric = formatted.replace(/,/g, '');
  return Number(numeric || 0);
};

const PRESET_CATEGORIES: ExpenseCategory[] = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Custom'];

export default function PersonalAddExpenseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: string;
    expense?: string;
    id?: string;
    title?: string;
    amount?: string;
    category?: string;
    paymentMethod?: string;
    expenseDate?: string;
    recurring?: string;
    recurringType?: string;
    note?: string;
    receiptUrl?: string;
  }>();

  const parsedExpenseParam = useMemo(() => {
    try {
      const raw = typeof params.expense === 'string' ? params.expense : '';
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, [params.expense]);

  const isEditMode = String(params.mode || '') === 'edit';
  const editingId = String(parsedExpenseParam?.id || parsedExpenseParam?._id || params.id || '');
  const incomingCategory = String(parsedExpenseParam?.category || params.category || '').trim();
  const shouldUseCustomCategory = Boolean(incomingCategory) && !PRESET_CATEGORIES.includes(incomingCategory as ExpenseCategory);

  const [amountInput, setAmountInput] = useState(() =>
    formatINR(String(parsedExpenseParam?.amount ?? params.amount ?? ''))
  );
  const [description, setDescription] = useState(() =>
    String(parsedExpenseParam?.description || params.title || '')
  );
  const [category, setCategory] = useState<ExpenseCategory>(() =>
    shouldUseCustomCategory ? 'Custom' : ((incomingCategory || 'Food') as ExpenseCategory)
  );
  const [customCategory, setCustomCategory] = useState(() => (shouldUseCustomCategory ? incomingCategory : ''));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(() => {
    const incoming = String(parsedExpenseParam?.paymentMethod || params.paymentMethod || 'Cash');
    return PAYMENT_OPTIONS.includes(incoming as PaymentMethod) ? (incoming as PaymentMethod) : 'Cash';
  });
  const [note, setNote] = useState(() => String(parsedExpenseParam?.note || params.note || ''));

  const [isRecurring, setIsRecurring] = useState(() => {
    if (parsedExpenseParam && typeof parsedExpenseParam.isRecurring === 'boolean') {
      return parsedExpenseParam.isRecurring;
    }
    return String(params.recurring || '0') === '1';
  });
  const [recurringType, setRecurringType] = useState<RecurringType>(() => {
    const incoming = String(parsedExpenseParam?.recurringType || params.recurringType || 'monthly');
    if (incoming === 'daily' || incoming === 'weekly' || incoming === 'monthly') {
      return incoming;
    }
    return 'monthly';
  });

  const [receiptUri, setReceiptUri] = useState<string>(
    () => String(parsedExpenseParam?.receiptUrl || params.receiptUrl || '')
  );
  const [saving, setSaving] = useState(false);

  const amount = useMemo(() => parseAmount(amountInput), [amountInput]);
  const resolvedCategory = category === 'Custom' ? customCategory.trim() : category;
  const canSubmit = amount > 0 && description.trim().length > 0 && resolvedCategory.length > 0 && !saving;

  const pickReceipt = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Needed', 'Allow photo library access to upload a receipt.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setReceiptUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Upload Failed', 'Could not pick image for receipt.');
    }
  };

  const saveExpense = async () => {
    if (!canSubmit) {
      return;
    }

    try {
      void hapticImpactLight();
      setSaving(true);

      const payload = {
        description: description.trim(),
        amount,
        category: resolvedCategory,
        paymentMethod,
        expenseDate: String(parsedExpenseParam?.expenseDate || params.expenseDate || new Date().toISOString()),
        isRecurring,
        recurringType: isRecurring ? recurringType : undefined,
        note: note.trim() || undefined,
        receiptUrl: receiptUri || undefined,
      };

      if (isEditMode && editingId) {
        await updateExpense(editingId, payload);
        Alert.alert('Updated', 'Personal expense updated successfully.');
      } else {
        await addExpense(payload);
        showSuccessToast('✅ Expense saved');
        Alert.alert('Saved', 'Personal expense added successfully.');
      }

      router.replace('/personal');
    } catch (error: any) {
      Alert.alert('Save Failed', error?.response?.data?.message || 'Could not save personal expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable style={styles.backdrop} onPress={() => router.back()}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
      </Pressable>

      <View style={styles.sheetWrap}>
        <View style={styles.sheetHandle} />

          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
              <Ionicons name="chevron-back" size={18} color={COLORS.textPrimary} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{isEditMode ? 'Edit Expense' : 'Add Personal Expense'}</Text>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.amountCard}>
            <Text style={styles.sectionLabel}>Amount</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currency}>₹</Text>
              <TextInput
                value={amountInput}
                onChangeText={(text) => setAmountInput(formatINR(text))}
                placeholder="0"
                placeholderTextColor={COLORS.textSecondary}
                style={styles.amountInput}
                keyboardType="decimal-pad"
                textAlign="center"
                maxLength={12}
              />
            </View>
            </View>

            <View style={styles.formCard}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What did you spend on?"
              placeholderTextColor={COLORS.textSecondary}
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORY_OPTIONS.map((option) => {
                const active = category === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.categoryBtn, active && styles.categoryBtnActive]}
                    activeOpacity={0.85}
                    onPress={() => setCategory(option.key)}
                  >
                    <Text style={styles.categoryEmoji}>{option.emoji}</Text>
                    <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{option.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {category === 'Custom' ? (
              <TextInput
                value={customCategory}
                onChangeText={setCustomCategory}
                placeholder="Enter custom category"
                placeholderTextColor={COLORS.textSecondary}
                style={styles.input}
                maxLength={64}
              />
            ) : null}

            <Text style={styles.inputLabel}>Payment</Text>
            <View style={styles.toggleRow}>
              {PAYMENT_OPTIONS.map((option) => {
                const active = paymentMethod === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.toggleBtn, active && styles.toggleBtnActive]}
                    onPress={() => setPaymentMethod(option)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.recurringHeader}>
              <Text style={styles.inputLabel}>Recurring</Text>
              <Switch
                value={isRecurring}
                onValueChange={setIsRecurring}
                trackColor={{ false: '#2A2A3A', true: 'rgba(124, 92, 252, 0.5)' }}
                thumbColor={isRecurring ? COLORS.violet : '#AAAAAA'}
              />
            </View>

            <View style={styles.recurringOptionsWrap}>
              <TouchableOpacity
                style={[styles.recurringChip, !isRecurring && styles.toggleBtnActive]}
                onPress={() => setIsRecurring(false)}
                activeOpacity={0.85}
              >
                <Text style={[styles.toggleText, !isRecurring && styles.toggleTextActive]}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.recurringChip, isRecurring && recurringType === 'daily' && styles.toggleBtnActive]}
                onPress={() => {
                  setIsRecurring(true);
                  setRecurringType('daily');
                }}
                activeOpacity={0.85}
              >
                <Text style={[styles.toggleText, isRecurring && recurringType === 'daily' && styles.toggleTextActive]}>
                  Daily
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.recurringChip, isRecurring && recurringType === 'monthly' && styles.toggleBtnActive]}
                onPress={() => {
                  setIsRecurring(true);
                  setRecurringType('monthly');
                }}
                activeOpacity={0.85}
              >
                <Text style={[styles.toggleText, isRecurring && recurringType === 'monthly' && styles.toggleTextActive]}>
                  Monthly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.recurringChip, isRecurring && recurringType === 'weekly' && styles.toggleBtnActive]}
                onPress={() => {
                  setIsRecurring(true);
                  setRecurringType('weekly');
                }}
                activeOpacity={0.85}
              >
                <Text style={[styles.toggleText, isRecurring && recurringType === 'weekly' && styles.toggleTextActive]}>
                  Weekly
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Receipt Upload</Text>
            <TouchableOpacity style={styles.uploadBtn} onPress={pickReceipt} activeOpacity={0.85}>
              <Ionicons name="image-outline" size={17} color={COLORS.mint} />
              <Text style={styles.uploadText}>{receiptUri ? 'Receipt selected' : 'Upload receipt image'}</Text>
            </TouchableOpacity>
            {receiptUri ? (
              <Text style={styles.uriText} numberOfLines={1}>
                {receiptUri}
              </Text>
            ) : null}

            <Text style={styles.inputLabel}>Note (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Add a short note"
              placeholderTextColor={COLORS.textSecondary}
              style={[styles.input, styles.textArea]}
              multiline
            />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, !canSubmit && styles.saveBtnDisabled]}
              onPress={saveExpense}
              activeOpacity={0.88}
              disabled={!canSubmit}
            >
              <Text style={styles.saveText}>{saving ? 'Saving...' : isEditMode ? 'Update Expense' : 'Save Expense'}</Text>
            </TouchableOpacity>
          </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheetWrap: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    height: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetHandle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 2,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10,
    gap: 4,
  },
  backText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontFamily: 'Syne_700Bold',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 52,
    gap: 14,
  },
  amountCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(124, 92, 252, 0.3)',
    backgroundColor: COLORS.elevated,
    paddingVertical: 18,
    paddingHorizontal: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'DMSans_500Medium',
    marginBottom: 10,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currency: {
    color: COLORS.amber,
    fontSize: 30,
    marginRight: 4,
    fontFamily: 'Syne_700Bold',
  },
  amountInput: {
    minWidth: 170,
    color: COLORS.textPrimary,
    fontSize: 42,
    fontFamily: 'Syne_700Bold',
    textAlign: 'center',
  },
  formCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.input,
    padding: 14,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    marginBottom: 10,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryBtn: {
    width: '48.5%',
    minHeight: 68,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBtnActive: {
    borderColor: 'rgba(124, 92, 252, 0.9)',
    backgroundColor: 'rgba(124, 92, 252, 0.2)',
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: 6,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
  },
  categoryTextActive: {
    color: COLORS.textPrimary,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  recurringOptionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    marginBottom: 8,
  },
  recurringChip: {
    width: '48.5%',
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtn: {
    flex: 1,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(124, 92, 252, 0.22)',
    borderColor: 'rgba(124, 92, 252, 0.8)',
  },
  toggleText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
  },
  toggleTextActive: {
    color: COLORS.textPrimary,
  },
  recurringHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  uploadBtn: {
    height: 42,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 176, 0.4)',
    backgroundColor: 'rgba(0, 229, 176, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  uploadText: {
    color: '#C7FFF1',
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
  },
  uriText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginBottom: 8,
    fontFamily: 'DMSans_500Medium',
  },
  saveBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.violet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Syne_700Bold',
  },
});