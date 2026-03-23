import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService } from '@/src/services';
import { GroupType, GROUP_TYPE_MAP, CreateGroupFormData } from '@/src/types/group.types';
import { GroupTypeSelector } from '@/src/components/groups/GroupTypeSelector';
import { TripDatePicker } from '@/src/components/groups/TripDatePicker';

type CreateStep = 1 | 2 | 3;

interface FormData {
  type: GroupType | null;
  name: string;
  emoji: string;
  tripDestination: string;
  tripBudget: string;
  trackBudget: boolean;
  tripStartDate: Date | null;
  tripEndDate: Date | null;
  description: string;
}

const EMOJI_OPTIONS = ['👥', '✈️', '🍽️', '🏠', '🎉', '🎓', '💼', '🏖️', '🗺️', '🎪'];

export default function CreateGroupScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const [step, setStep] = useState<CreateStep>(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    type: null,
    name: '',
    emoji: '👥',
    tripDestination: '',
    tripBudget: '',
    trackBudget: false,
    tripStartDate: null,
    tripEndDate: null,
    description: '',
  });

  const isTrip = form.type === GroupType.TRIP;

  const canProceedStep1 = form.type !== null;
  const canProceedStep2 = form.name.trim() !== '' && form.emoji;
  const canProceedStep3 = isTrip 
    ? form.tripStartDate && form.tripEndDate 
    : true;

  const handleTypeSelect = (type: GroupType) => {
    setForm({ ...form, type });
  };

  const handleNext = () => {
    if (step === 1 && canProceedStep1) {
      setStep(2);
    } else if (step === 2 && canProceedStep2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as CreateStep);
    } else {
      router.back();
    }
  };

  const handleCreate = async () => {
    if (!form.type || !form.name || !form.emoji) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (isTrip && (!form.tripStartDate || !form.tripEndDate)) {
      Alert.alert('Error', 'Please select trip dates');
      return;
    }

    try {
      setLoading(true);

      const createData: any = {
        type: form.type,
        name: form.name,
        emoji: form.emoji,
        description: form.description,
      };

      if (isTrip) {
        createData.tripStartDate = form.tripStartDate;
        createData.tripEndDate = form.tripEndDate;
        createData.tripDestination = form.tripDestination;
        createData.tripBudget = form.tripBudget ? parseFloat(form.tripBudget) : null;
        createData.trackBudget = form.trackBudget;
      }

      const response = await apiService.groups.create(createData);
      
      Alert.alert('Success', 'Group created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            router.replace(`/group/${response.data.id}` as any);
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error creating group:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || error.response?.data?.message || 'Failed to create group'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.elevated }]}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Group</Text>
        <Text style={[styles.stepIndicator, { color: colors.icon }]}>{step}/3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Step 1: Select Type */}
        {step === 1 && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Group Type</Text>
            <Text style={[styles.sectionDescription, { color: colors.icon }]}>
              Choose what kind of group this is
            </Text>
            <GroupTypeSelector
              selectedType={form.type}
              onSelectType={handleTypeSelect}
            />
          </View>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Group Details</Text>
            
            {/* Emoji Selector */}
            <View style={[styles.section]}>
              <Text style={[styles.label, { color: colors.text }]}>Choose Emoji</Text>
              <View style={[styles.emojiGrid]}>
                {EMOJI_OPTIONS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiOption,
                      {
                        backgroundColor: form.emoji === emoji ? colors.violet : colors.elevated,
                        borderColor: form.emoji === emoji ? colors.violet : colors.card,
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() => setForm({ ...form, emoji })}
                  >
                    <Text style={styles.emoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Group Name */}
            <View style={[styles.section]}>
              <Text style={[styles.label, { color: colors.text }]}>Group Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.elevated,
                    color: colors.text,
                    borderColor: colors.card,
                  },
                ]}
                placeholder="e.g., Bali Trip 2025"
                placeholderTextColor={colors.icon}
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
              />
            </View>

            {/* Description */}
            <View style={[styles.section]}>
              <Text style={[styles.label, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.multilineInput,
                  {
                    backgroundColor: colors.elevated,
                    color: colors.text,
                    borderColor: colors.card,
                  },
                ]}
                placeholder="Optional description"
                placeholderTextColor={colors.icon}
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        )}

        {/* Step 3: Trip Details (if trip) */}
        {step === 3 && isTrip && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Trip Details</Text>

            {/* Dates */}
            <View style={[styles.section]}>
              <Text style={[styles.label, { color: colors.text }]}>Trip Dates *</Text>
              <TripDatePicker
                startDate={form.tripStartDate}
                endDate={form.tripEndDate}
                onStartDateChange={(date) => setForm({ ...form, tripStartDate: date })}
                onEndDateChange={(date) => setForm({ ...form, tripEndDate: date })}
              />
            </View>

            {/* Destination */}
            <View style={[styles.section]}>
              <Text style={[styles.label, { color: colors.text }]}>Destination</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.elevated,
                    color: colors.text,
                    borderColor: colors.card,
                  },
                ]}
                placeholder="e.g., Bali, Indonesia"
                placeholderTextColor={colors.icon}
                value={form.tripDestination}
                onChangeText={(text) => setForm({ ...form, tripDestination: text })}
              />
            </View>

            {/* Budget Tracking */}
            <View style={[styles.section]}>
              <View style={styles.budgetHeader}>
                <Text style={[styles.label, { color: colors.text }]}>Track Budget</Text>
                <TouchableOpacity
                  onPress={() => setForm({ ...form, trackBudget: !form.trackBudget })}
                >
                  <View
                    style={[
                      styles.toggle,
                      {
                        backgroundColor: form.trackBudget ? colors.mint : colors.elevated,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleThumb,
                        {
                          transform: [{ translateX: form.trackBudget ? 20 : 0 }],
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Budget Amount */}
            {form.trackBudget && (
              <View style={[styles.section]}>
                <Text style={[styles.label, { color: colors.text }]}>Trip Budget</Text>
                <View style={[styles.currencyInput, { borderColor: colors.card }]}>
                  <Text style={[styles.currencySymbol, { color: colors.icon }]}>₹</Text>
                  <TextInput
                    style={[
                      styles.budgetInput,
                      {
                        color: colors.text,
                      },
                    ]}
                    placeholder="Enter budget amount"
                    placeholderTextColor={colors.icon}
                    value={form.tripBudget}
                    onChangeText={(text) => setForm({ ...form, tripBudget: text })}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {/* Step 3: Basic (if not trip) */}
        {step === 3 && !isTrip && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ready to Create</Text>
            <Text style={[styles.sectionDescription, { color: colors.icon }]}>
              {form.emoji} {form.name}
            </Text>
            <View style={[styles.previewCard, { backgroundColor: colors.elevated }]}>
              <Text style={[styles.previewEmoji]}>{form.emoji}</Text>
              <Text style={[styles.previewName, { color: colors.text }]}>{form.name}</Text>
              {form.description && (
                <Text style={[styles.previewDesc, { color: colors.icon }]}>
                  {form.description}
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.elevated }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.card }]}
          onPress={handleBack}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: colors.violet,
              opacity: step === 1 && !canProceedStep1 ? 0.5 : 1,
            },
          ]}
          disabled={step === 1 && !canProceedStep1}
          onPress={step === 3 ? handleCreate : handleNext}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonTextPrimary}>
              {step === 3 ? 'Create Group' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Syne',
  },
  stepIndicator: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Syne',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
  },
  multilineInput: {
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emojiOption: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  currencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontFamily: 'Syne',
    marginRight: 4,
  },
  budgetInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
  },
  previewCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  previewEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  previewName: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Syne',
    marginBottom: 8,
  },
  previewDesc: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
  },
  buttonTextPrimary: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
  },
});
