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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '@/src/services/api';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AmountInput } from '@/components/expenses/AmountInput';
import { CategorySelector } from '@/components/expenses/CategorySelector';
import { SplitTypeSelector } from '@/components/expenses/SplitTypeSelector';
import { MemberSelector } from '@/components/expenses/MemberSelector';
import { SplitPreview } from '@/components/expenses/SplitPreview';
import {
  SplitType,
  Participant,
  calculateSplit,
  validateSplit,
  formatAmount,
} from '@/src/utils/splitCalculator';

interface GroupMember {
  userId: string;
  userName: string;
}

export default function AddExpenseScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams();

  // Form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date());
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('equally');
  const [selectedMembers, setSelectedMembers] = useState<Participant[]>([]);
  const [notes, setNotes] = useState('');

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
      
      // Select all members by default for equal split
      setSelectedMembers(
        members.map((m) => ({
          userId: m.userId,
          userName: m.userName,
          value: 0,
        }))
      );
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load group data');
      router.back();
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    try {
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
        splitType,
        splitBetween: selectedMembers.map((m) => m.userId),
        groupId: groupId as string,
        date: date.toISOString(),
        notes: notes.trim(),
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

      await apiService.groups.addExpense(groupId as string, requestBody);

      Alert.alert('Success', 'Expense added successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
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
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </SafeAreaView>
    );
  }

  const numAmount = parseFloat(amount) || 0;
  const splitResults = numAmount > 0 ? calculateSplit(splitType, numAmount, selectedMembers) : null;
  const splitValidation = validateSplit(splitType, numAmount, selectedMembers);
  const paidByMember = groupMembers.find((m) => m.userId === paidBy);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.elevated }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Expense</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Input */}
        <AmountInput
          value={amount}
          onChange={setAmount}
          error={errors.amount}
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

        {/* Category */}
        <CategorySelector selected={category} onSelect={setCategory} />

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

        {/* Split Type */}
        <SplitTypeSelector selected={splitType} onSelect={handleSplitTypeChange} />

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
          paidByUserId={paidBy}
          paidByUserName={paidByMember?.userName || 'Unknown'}
          totalAmount={numAmount}
          currentUserId={currentUserId}
          validationError={!splitValidation.valid ? splitValidation.error : undefined}
        />

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
          style={[styles.saveButton, (submitting || !splitValidation.valid) && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting || !splitValidation.valid}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
              <Text style={styles.saveButtonText}>Save Expense</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
    marginLeft: 12,
  },
  paidByList: {
    gap: 10,
  },
  paidByOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  paidByOptionSelected: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366f1',
  },
  paidByText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#475569',
    flex: 1,
  },
  paidByTextSelected: {
    fontWeight: '700',
    color: '#6366f1',
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
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
