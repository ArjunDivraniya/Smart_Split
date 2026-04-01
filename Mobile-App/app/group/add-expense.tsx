import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '@/src/services/api';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AmountInput } from '@/components/expenses/AmountInput';
import { CategoryPicker } from '@/components/expenses/CategoryPicker';
import { SplitTypeSelector } from '@/src/components/groups/SplitTypeSelector';
import { MemberSelector } from '@/components/expenses/MemberSelector';
import { SplitPreview } from '@/src/components/groups/SplitPreview';
import { MemberPicker } from '@/src/components/groups/MemberPicker';
import {
  SplitType,
  Participant,
  calculateSplit,
  validateSplit,
  formatAmount,
} from '@/src/utils/splitCalculator';
import { hapticImpactLight } from '@/src/utils/haptics';
import { showSuccessToast } from '@/src/utils/toast';
import { useBackNavigation } from '@/src/hooks/useBackNavigation';

interface GroupMember {
  userId: string;
  userName: string;
}

type PaymentMethod = 'cash' | 'upi' | 'card';

interface ExpenseFormViewProps {
  groupId: string;
  expenseId?: string;
  expenseData?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ExpenseFormView({
  groupId,
  expenseId,
  expenseData,
  onClose,
  onSuccess,
}: ExpenseFormViewProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors.dark; // Force dark theme for consistency
  const isEditMode = Boolean(expenseId);
  const screenHeight = Dimensions.get('window').height;

  // Form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date());
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('equally');
  const [selectedMembers, setSelectedMembers] = useState<Participant[]>([]);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [receiptUrl, setReceiptUrl] = useState('');

  // Group data
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [groupId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load current user
      const userResponse = await apiService.user.getMe();
      const userData = userResponse?.data?.data || userResponse?.data || {};
      const resolvedUser = userData?.user || userData;
      const userId = resolvedUser?._id || resolvedUser?.id || '';
      const userName = resolvedUser?.name || 'You';
      setCurrentUserId(userId);
      setCurrentUserName(userName);
      setPaidBy(userId); // Default payer is current user

      // Load group members
      const groupResponse = await apiService.groups.getById(groupId as string);
      const group = groupResponse?.data?.data || groupResponse?.data || {};

      // Extract members
      const members: GroupMember[] = [];
      
      // Add creator
      if (group.createdBy) {
        const creatorId = typeof group.createdBy === 'object' ? group.createdBy._id : group.createdBy;
        const creatorName = typeof group.createdBy === 'object' ? group.createdBy.name : 'Creator';
        members.push({
          userId: creatorId,
          userName: creatorName,
        });
      }

      // Add other members
      if (group.members) {
        group.members.forEach((member: any) => {
          const memberId = typeof member.userId === 'object' ? member.userId._id : member.userId;
          const memberName = member.userName || (typeof member.userId === 'object' ? member.userId.name : 'Member');
          
          // Avoid duplicates
          if (!members.some((m) => m.userId === memberId)) {
            members.push({
              userId: memberId,
              userName: memberName,
            });
          }
        });
      }

      setGroupMembers(members);

      const defaultSelected = members.map((m) => ({
        userId: m.userId,
        userName: m.userName,
        value: 0,
      }));

      if (isEditMode && typeof expenseData === 'string') {
        try {
          const parsed = JSON.parse(decodeURIComponent(expenseData));
          const parsedSplitType: SplitType = ['equally', 'unequally', 'percentage', 'shares'].includes(parsed?.splitType)
            ? parsed.splitType
            : 'equally';

          const selectedIds = new Set(
            Array.isArray(parsed?.splitBetween)
              ? parsed.splitBetween
                  .map((item: any) => (typeof item === 'string' ? item : item?.userId || item?._id || ''))
                  .filter(Boolean)
              : []
          );

          const baseMembers = defaultSelected.filter((m) => selectedIds.size === 0 || selectedIds.has(m.userId));
          const withValues = baseMembers.map((m) => {
            let value = 0;
            if (parsedSplitType === 'shares') {
              value = Number(parsed?.splitShares?.[m.userId] || 1);
            } else if (parsedSplitType === 'percentage') {
              value = Number(parsed?.splitPercentages?.[m.userId] || 0);
            } else if (parsedSplitType === 'unequally') {
              value = Number(parsed?.splitAmounts?.[m.userId] || 0);
            }
            return { ...m, value };
          });

          setAmount(String(parsed?.amount ?? ''));
          setDescription(parsed?.description || '');
          setCategory(parsed?.category || 'Food');
          setDate(parsed?.date ? new Date(parsed.date) : new Date());
          setPaidBy(parsed?.paidBy?._id || parsed?.paidBy || userId);
          setSplitType(parsedSplitType);
          setNotes(parsed?.notes || '');
          setPaymentMethod(
            parsed?.paymentMethod === 'upi' || parsed?.paymentMethod === 'card' ? parsed.paymentMethod : 'cash'
          );
          setReceiptUrl(parsed?.receiptUrl || '');
          setSelectedMembers(withValues.length > 0 ? withValues : defaultSelected);
        } catch {
          setSelectedMembers(defaultSelected);
        }
      } else {
        // Default for add mode
        setSelectedMembers(defaultSelected);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load group data');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleMemberToggle = (userId: string) => {
    const member = groupMembers.find((m) => m.userId === userId);
    if (!member) return;

    if (selectedMembers.some((m) => m.userId === userId)) {
      // Remove member
      setSelectedMembers(selectedMembers.filter((m) => m.userId !== userId));
    } else {
      // Add member with default value based on split type
      const defaultValue = splitType === 'shares' ? 1 : 0;
      setSelectedMembers([
        ...selectedMembers,
        { userId: member.userId, userName: member.userName, value: defaultValue },
      ]);
    }
  };

  const handleMemberValueChange = (userId: string, value: number) => {
    setSelectedMembers(
      selectedMembers.map((m) =>
        m.userId === userId ? { ...m, value } : m
      )
    );
  };

  const handleSelectAllMembers = () => {
    const defaultValue = splitType === 'shares' ? 1 : 0;
    const selectedMap = new Map(selectedMembers.map((m) => [m.userId, m]));

    const allSelected = groupMembers.map((member) => {
      const existing = selectedMap.get(member.userId);
      return (
        existing || {
          userId: member.userId,
          userName: member.userName,
          value: defaultValue,
        }
      );
    });

    setSelectedMembers(allSelected);
  };

  const handleDeselectAllMembers = () => {
    setSelectedMembers([]);
  };

  const handleSplitTypeChange = (type: SplitType) => {
    setSplitType(type);
    
    // Reset values based on split type
    if (type === 'equally') {
      setSelectedMembers(
        selectedMembers.map((m) => ({ ...m, value: 0 }))
      );
    } else if (type === 'shares') {
      setSelectedMembers(
        selectedMembers.map((m) => ({ ...m, value: 1 }))
      );
    } else {
      setSelectedMembers(
        selectedMembers.map((m) => ({ ...m, value: 0 }))
      );
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const numAmount = parseFloat(amount);
    if (!amount || numAmount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!paidBy) {
      newErrors.paidBy = 'Please select who paid';
    }

    if (selectedMembers.length === 0) {
      newErrors.members = 'At least one member must be selected';
    }

    // Validate split
    const splitValidation = validateSplit(splitType, numAmount, selectedMembers);
    if (!splitValidation.valid) {
      newErrors.split = splitValidation.error || 'Invalid split';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickReceiptImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow media library access to upload receipt.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setReceiptUrl(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Unable to pick image.');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    try {
      void hapticImpactLight();
      setSubmitting(true);

      const numAmount = parseFloat(amount);
      const splitResults = calculateSplit(splitType, numAmount, selectedMembers);

      if (!splitResults) {
        Alert.alert('Error', 'Failed to calculate split');
        return;
      }

      // Build request body
      const requestBody: any = {
        amount: numAmount,
        description: description.trim(),
        category,
        paidBy,
        paymentMethod,
        splitType,
        splitBetween: selectedMembers.map((m) => m.userId),
        groupId: groupId as string,
        date: date.toISOString(),
        notes: notes.trim(),
        receiptUrl: receiptUrl || undefined,
      };

      // Add split-specific data
      if (splitType === 'percentage') {
        requestBody.splitPercentages = {};
        selectedMembers.forEach((m) => {
          requestBody.splitPercentages[m.userId] = m.value || 0;
        });
      } else if (splitType === 'unequally') {
        requestBody.splitAmounts = {};
        selectedMembers.forEach((m) => {
          requestBody.splitAmounts[m.userId] = m.value || 0;
        });
      } else if (splitType === 'shares') {
        requestBody.splitShares = {};
        selectedMembers.forEach((m) => {
          requestBody.splitShares[m.userId] = m.value || 1;
        });
      }

      if (isEditMode && typeof expenseId === 'string') {
        await apiService.expenses.update(expenseId, requestBody);
      } else {
        await apiService.groups.addExpense(groupId as string, requestBody);
        showSuccessToast('✅ Expense saved');
      }

      Alert.alert('Success', isEditMode ? 'Expense updated successfully' : 'Expense added successfully', [
        {
          text: 'OK',
          onPress: () => {
            onSuccess?.();
            onClose();
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error adding expense:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to add expense'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
        </Pressable>

        <View style={[styles.sheetWrap, { backgroundColor: colors.background, minHeight: 400 }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.violet} />
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  const numAmount = parseFloat(amount) || 0;
  let splitResults: ReturnType<typeof calculateSplit> | null = null;
  try {
    splitResults = numAmount > 0 ? calculateSplit(splitType, numAmount, selectedMembers) : null;
  } catch {
    splitResults = null;
  }
  const splitValidation = validateSplit(splitType, numAmount, selectedMembers);
  const isFormBaseValid =
    numAmount > 0 && Boolean(description.trim()) && Boolean(paidBy) && selectedMembers.length > 0;
  const canSave = !submitting && isFormBaseValid && splitValidation.valid;
  const footerHint = !canSave
    ? splitValidation.error || 'Complete all required fields to enable save'
    : '';

  return (
    <KeyboardAvoidingView
      style={styles.overlay}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
      </Pressable>
      <StatusBar style="light" />

      <View style={[styles.sheetWrap, { backgroundColor: colors.background }]}>
        <View style={styles.sheetHandle} />
        
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.elevated }]}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{isEditMode ? 'Edit Expense' : 'Add Expense'}</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={!canSave} style={styles.headerSaveWrap}>
          <Text style={[styles.headerSaveText, { color: canSave ? colors.violet : colors.icon }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1 - Amount */}
        <View style={[styles.amountSection, { minHeight: screenHeight * 0.3 }]}>
          <AmountInput
            value={amount}
            onChange={setAmount}
            error={errors.amount}
          />
        </View>

        {/* Section 2 - Details */}
        <CategoryPicker
          selected={category}
          onSelect={setCategory}
          description={description}
        />

        {/* Description */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Description</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.background, borderColor: colors.elevated, color: colors.text },
              errors.description && styles.inputError,
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="What was this expense for?"
            placeholderTextColor={colors.icon}
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}
        </View>

        {/* Date Picker */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Date</Text>
          <TouchableOpacity style={[styles.dateButton, { backgroundColor: colors.background, borderColor: colors.elevated }]}> 
            <Ionicons name="calendar" size={20} color="#6366f1" />
            <Text style={[styles.dateText, { color: colors.text }]}> 
              {date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Who Paid */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Who Paid?</Text>
          <View style={styles.paidByList}>
            {groupMembers.map((member) => {
              const isSelected = paidBy === member.userId;
              const isCurrentUser = member.userId === currentUserId;

              return (
                <TouchableOpacity
                  key={member.userId}
                  style={[
                    styles.paidByOption,
                    { backgroundColor: colors.background, borderColor: colors.elevated },
                    isSelected && styles.paidByOptionSelected,
                    isSelected && { backgroundColor: `${colors.violet}20`, borderColor: colors.violet },
                  ]}
                  onPress={() => setPaidBy(member.userId)}
                >
                  <View style={styles.radioOuter}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.paidByText, { color: colors.text }, isSelected && styles.paidByTextSelected]}>
                    {isCurrentUser ? 'You' : member.userName}
                  </Text>
                  {isCurrentUser && !isSelected && (
                    <View style={styles.youBadge}>
                      <Text style={styles.youBadgeText}>You</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.paidBy && (
            <Text style={styles.errorText}>{errors.paidBy}</Text>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Payment Method</Text>
          <View style={styles.paymentMethodsRow}>
            {([
              { key: 'cash', label: 'Cash', icon: 'cash-outline' },
              { key: 'upi', label: 'UPI', icon: 'phone-portrait-outline' },
              { key: 'card', label: 'Card', icon: 'card-outline' },
            ] as const).map((method) => {
              const selected = paymentMethod === method.key;
              return (
                <TouchableOpacity
                  key={method.key}
                  style={[
                    styles.paymentMethodBtn,
                    {
                      backgroundColor: selected ? `${colors.violet}22` : colors.background,
                      borderColor: selected ? colors.violet : colors.elevated,
                    },
                  ]}
                  onPress={() => setPaymentMethod(method.key)}
                >
                  <Ionicons
                    name={method.icon as any}
                    size={16}
                    color={selected ? colors.violet : colors.icon}
                  />
                  <Text style={[styles.paymentMethodText, { color: selected ? colors.violet : colors.text }]}>
                    {method.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 3 - Split */}
        {/* Split Type */}
        <SplitTypeSelector
          selected={splitType}
          onSelect={handleSplitTypeChange}
          totalAmount={numAmount}
          participants={selectedMembers}
        />

        <MemberPicker
          members={groupMembers}
          selectedMemberIds={selectedMembers.map((m) => m.userId)}
          currentUserId={currentUserId}
          onToggle={handleMemberToggle}
          onSelectAll={handleSelectAllMembers}
          onDeselectAll={handleDeselectAllMembers}
        />

        {/* Member Selector */}
        <MemberSelector
          members={groupMembers}
          selected={selectedMembers}
          onToggle={handleMemberToggle}
          splitType={splitType}
          onValueChange={handleMemberValueChange}
          currentUserId={currentUserId}
        />
        {errors.members && (
          <Text style={[styles.errorText, { marginHorizontal: 16 }]}>{errors.members}</Text>
        )}

        {/* Split Preview */}
        <SplitPreview
          splitResults={splitResults}
          totalAmount={numAmount}
          currentUserId={currentUserId}
          validationError={!splitValidation.valid ? splitValidation.error : undefined}
        />

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Receipt (Optional)</Text>
          <TouchableOpacity
            style={[styles.receiptButton, { backgroundColor: colors.background, borderColor: colors.elevated }]}
            onPress={pickReceiptImage}
          >
            <Ionicons name="image-outline" size={18} color={colors.violet} />
            <Text style={[styles.receiptButtonText, { color: colors.text }]}>Upload Receipt Photo</Text>
          </TouchableOpacity>
          {receiptUrl ? (
            <View style={styles.receiptPreviewWrap}>
              <Image source={{ uri: receiptUrl }} style={styles.receiptPreview} />
              <TouchableOpacity style={styles.removeReceiptBtn} onPress={() => setReceiptUrl('')}>
                <Ionicons name="close-circle" size={22} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Notes */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Notes (Optional)</Text>
          <TextInput
            style={[
              styles.input,
              styles.notesInput,
              { backgroundColor: colors.background, borderColor: colors.elevated, color: colors.text },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any additional notes..."
            placeholderTextColor={colors.icon}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.elevated }]}> 
        <TouchableOpacity
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={!canSave}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
              <Text style={styles.saveButtonText}>{isEditMode ? 'Update Expense' : 'Save Expense'}</Text>
            </>
          )}
        </TouchableOpacity>
        {!canSave && (
          <Text style={styles.footerHintText}>{footerHint}</Text>
        )}
      </View>
      </View>
    </KeyboardAvoidingView>
  );
}

export default function AddExpenseScreen() {
  const router = useRouter();
  const { id: routeGroupId, expenseId, expenseData } = useLocalSearchParams();
  const handleBack = useBackNavigation('/(tabs)/groups' as any, () => {
    const resolvedGroupId = String(routeGroupId || '').trim();
    return resolvedGroupId ? (`/group/${resolvedGroupId}` as any) : ('/(tabs)/groups' as any);
  }, { alwaysUseFallback: true });

  return (
    <ExpenseFormView
      groupId={String(routeGroupId || '')}
      expenseId={typeof expenseId === 'string' ? expenseId : undefined}
      expenseData={typeof expenseData === 'string' ? expenseData : undefined}
      onClose={handleBack}
    />
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSaveWrap: {
    minWidth: 42,
    alignItems: 'flex-end',
  },
  headerSaveText: {
    fontSize: 15,
    fontFamily: 'DMSans_700Bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  amountSection: {
    justifyContent: 'center',
  },
  section: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    marginTop: 6,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
  },
  paidByList: {
    gap: 10,
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentMethodBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  paymentMethodText: {
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  paidByOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  paidByOptionSelected: {
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  paidByText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  paidByTextSelected: {
    fontWeight: '700',
  },
  youBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#22c55e',
    borderRadius: 8,
  },
  youBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  footerHintText: {
    marginTop: 8,
    fontSize: 12,
    color: '#ef4444',
    textAlign: 'center',
    fontFamily: 'DMSans_700Bold',
  },
  receiptButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  receiptButtonText: {
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
  },
  receiptPreviewWrap: {
    marginTop: 12,
    position: 'relative',
  },
  receiptPreview: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    backgroundColor: '#111827',
  },
  removeReceiptBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
  },
});
