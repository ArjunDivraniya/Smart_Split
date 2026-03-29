import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GroupTypeSelector, GroupTypeSelectorValue } from '@/src/components/groups/GroupTypeSelector';
import { TripDatePicker } from '@/src/components/groups/TripDatePicker';
import { addMember, createGroup } from '@/src/services/groups.service';
import api from '@/src/services/api';
import { GroupType } from '@/src/types/group.types';
import { showInfoToast } from '@/src/utils/toast';

type CreateStep = 1 | 2 | 3;

type SearchUser = {
  _id: string;
  name?: string;
  email: string;
  profileImage?: string;
};

type FormState = {
  type: GroupType | null;
  name: string;
  emoji: string;
  description: string;
  tripDestination: string;
  tripStartDate: Date | null;
  tripEndDate: Date | null;
  tripBudget: string;
};

const GROUP_TYPE_SELECTION_MAP: Record<GroupTypeSelectorValue, { type: GroupType; emoji: string }> = {
  trip: { type: GroupType.TRIP, emoji: '✈️' },
  college: { type: GroupType.COLLEGE, emoji: '🎓' },
  flatmates: { type: GroupType.FLATMATES, emoji: '🏠' },
  event: { type: GroupType.EVENT, emoji: '🎉' },
  food_run: { type: GroupType.FOOD, emoji: '🍔' },
  office: { type: GroupType.CUSTOM, emoji: '💼' },
  custom: { type: GroupType.CUSTOM, emoji: '➕' },
};

const EMOJI_OPTIONS = ['👥', '✈️', '🎓', '🏠', '🎉', '🍔', '💼', '🧾', '🏖️', '🗺️', '🎯', '📌'];

const getInitials = (name?: string, email?: string): string => {
  const source = (name || email || '').trim();
  if (!source) return '?';
  const parts = source.split(' ').filter(Boolean);
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
};

export default function CreateGroupScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const [step, setStep] = useState<CreateStep>(1);
  const [submitting, setSubmitting] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [memberQuery, setMemberQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<SearchUser[]>([]);
  const [selectedTypeOption, setSelectedTypeOption] = useState<GroupTypeSelectorValue | null>(null);

  const [form, setForm] = useState<FormState>({
    type: null,
    name: '',
    emoji: '👥',
    description: '',
    tripDestination: '',
    tripStartDate: null,
    tripEndDate: null,
    tripBudget: '',
  });

  const isTrip = form.type === GroupType.TRIP;

  const canContinueStep1 = form.type !== null;
  const canContinueStep2 = useMemo(() => {
    if (!form.type || !form.name.trim()) {
      return false;
    }

    if (!isTrip) {
      return true;
    }

    return Boolean(form.tripStartDate && form.tripEndDate && form.tripDestination.trim() && form.tripBudget.trim());
  }, [form, isTrip]);

  const handleBack = () => {
    if (step === 1) {
      router.back();
      return;
    }
    setStep((prev) => (prev - 1) as CreateStep);
  };

  const handleTypeSelect = (selectedOption: GroupTypeSelectorValue) => {
    const mappedOption = GROUP_TYPE_SELECTION_MAP[selectedOption];
    setSelectedTypeOption(selectedOption);

    setForm((prev) => ({
      ...prev,
      type: mappedOption.type,
      emoji: mappedOption.emoji,
    }));
  };

  const handleSearchUsers = async (query: string) => {
    setMemberQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchingUsers(true);
      const response = await api.get('/user/search', {
        params: { query: query.trim() },
      });

      const usersData = Array.isArray(response?.data?.data) ? response.data.data : [];
      const selectedIds = new Set(selectedMembers.map((member) => member._id));
      setSearchResults(usersData.filter((user: SearchUser) => !selectedIds.has(user._id)));
    } catch {
      setSearchResults([]);
    } finally {
      setSearchingUsers(false);
    }
  };

  const addSelectedMember = (user: SearchUser) => {
    setSelectedMembers((prev) => {
      if (prev.some((member) => member._id === user._id)) {
        return prev;
      }
      return [...prev, user];
    });

    setSearchResults((prev) => prev.filter((result) => result._id !== user._id));
    setMemberQuery('');
  };

  const removeSelectedMember = (userId: string) => {
    setSelectedMembers((prev) => prev.filter((member) => member._id !== userId));
  };

  const handleCreateGroup = async () => {
    if (!form.type || !form.name.trim()) {
      Alert.alert('Missing details', 'Please complete required fields first.');
      return;
    }

    if (isTrip) {
      if (!form.tripStartDate || !form.tripEndDate || !form.tripDestination.trim() || !form.tripBudget.trim()) {
        Alert.alert('Trip details required', 'Please add destination, dates, and budget for this trip group.');
        return;
      }
    }

    try {
      setSubmitting(true);

      const payload: Record<string, any> = {
        name: form.name.trim(),
        type: form.type,
        emoji: form.emoji,
        description: form.description.trim(),
      };

      if (isTrip) {
        payload.tripDestination = form.tripDestination.trim();
        payload.tripStartDate = form.tripStartDate;
        payload.tripEndDate = form.tripEndDate;
        payload.tripBudget = Number(form.tripBudget);
        payload.trackBudget = true;
      }

      const createdGroup = await createGroup(payload);
      const groupId = createdGroup.id || createdGroup._id;

      if (!groupId) {
        throw new Error('Group created but id is missing');
      }

      if (selectedMembers.length > 0) {
        await Promise.allSettled(
          selectedMembers.map((member) => addMember(groupId, member._id))
        );
      }

      showInfoToast('👥 Group created');

      router.replace(`/group/${groupId}` as any);
    } catch (err: any) {
      Alert.alert(
        'Unable to create group',
        err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <View>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Step 1: Pick Type</Text>
      <Text style={[styles.sectionSubtitle, { color: colors.icon }]}>Select a group category to continue.</Text>
      <GroupTypeSelector
        selectedType={selectedTypeOption}
        onSelectType={handleTypeSelect}
      />
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Step 2: Group Details</Text>
      <Text style={[styles.sectionSubtitle, { color: colors.icon }]}>Add name, emoji and optional description.</Text>

      <View style={styles.fieldWrap}>
        <Text style={[styles.label, { color: colors.text }]}>Group Name *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.elevated, borderColor: colors.card, color: colors.text }]}
          placeholder="e.g., Goa Ride Squad"
          placeholderTextColor={colors.icon}
          value={form.name}
          onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
        />
      </View>

      <View style={styles.fieldWrap}>
        <Text style={[styles.label, { color: colors.text }]}>Emoji</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiRow}>
          {EMOJI_OPTIONS.map((emoji) => {
            const isSelected = form.emoji === emoji;
            return (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiChip,
                  {
                    backgroundColor: isSelected ? colors.violet : colors.elevated,
                    borderColor: isSelected ? colors.violet : colors.card,
                  },
                ]}
                onPress={() => setForm((prev) => ({ ...prev, emoji }))}
              >
                <Text style={styles.emojiChipText}>{emoji}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.fieldWrap}>
        <Text style={[styles.label, { color: colors.text }]}>Description (Optional)</Text>
        <TextInput
          style={[
            styles.input,
            styles.multiline,
            { backgroundColor: colors.elevated, borderColor: colors.card, color: colors.text },
          ]}
          placeholder="What is this group for?"
          placeholderTextColor={colors.icon}
          value={form.description}
          onChangeText={(text) => setForm((prev) => ({ ...prev, description: text }))}
          multiline
          numberOfLines={3}
        />
      </View>

      {isTrip && (
        <>
          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: colors.text }]}>Destination City *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.elevated, borderColor: colors.card, color: colors.text }]}
              placeholder="e.g., Manali"
              placeholderTextColor={colors.icon}
              value={form.tripDestination}
              onChangeText={(text) => setForm((prev) => ({ ...prev, tripDestination: text }))}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: colors.text }]}>Trip Dates *</Text>
            <TripDatePicker
              startDate={form.tripStartDate}
              endDate={form.tripEndDate}
              onStartDateChange={(date) => setForm((prev) => ({ ...prev, tripStartDate: date }))}
              onEndDateChange={(date) => setForm((prev) => ({ ...prev, tripEndDate: date }))}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: colors.text }]}>Budget *</Text>
            <View style={[styles.budgetWrap, { backgroundColor: colors.elevated, borderColor: colors.card }]}> 
              <Text style={[styles.currencyText, { color: colors.icon }]}>Rs</Text>
              <TextInput
                style={[styles.budgetInput, { color: colors.text }]}
                placeholder="Total trip budget"
                placeholderTextColor={colors.icon}
                keyboardType="decimal-pad"
                value={form.tripBudget}
                onChangeText={(text) => setForm((prev) => ({ ...prev, tripBudget: text.replace(/[^0-9.]/g, '') }))}
              />
            </View>
          </View>
        </>
      )}
    </View>
  );

  const renderSelectedMember = (member: SearchUser) => (
    <View key={member._id} style={styles.memberPill}>
      <View style={[styles.memberAvatar, { backgroundColor: colors.violet }]}> 
        <Text style={styles.memberAvatarText}>{getInitials(member.name, member.email)}</Text>
      </View>
      <Text style={[styles.memberPillText, { color: colors.text }]} numberOfLines={1}>
        {member.name || member.email}
      </Text>
      <TouchableOpacity onPress={() => removeSelectedMember(member._id)}>
        <Ionicons name="close-circle" size={18} color={colors.icon} />
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Step 3: Add Members</Text>
      <Text style={[styles.sectionSubtitle, { color: colors.icon }]}>Search by name or email and add members.</Text>

      <View style={styles.fieldWrap}>
        <Text style={[styles.label, { color: colors.text }]}>Selected Members</Text>
        {selectedMembers.length === 0 ? (
          <Text style={[styles.hintText, { color: colors.icon }]}>No members selected yet.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.memberRow}>
            {selectedMembers.map(renderSelectedMember)}
          </ScrollView>
        )}
      </View>

      <View style={styles.fieldWrap}>
        <Text style={[styles.label, { color: colors.text }]}>Find Members</Text>
        <View style={[styles.searchInputWrap, { backgroundColor: colors.elevated, borderColor: colors.card }]}> 
          <Ionicons name="search" size={18} color={colors.icon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by name or email"
            placeholderTextColor={colors.icon}
            value={memberQuery}
            onChangeText={handleSearchUsers}
          />
          {searchingUsers ? <ActivityIndicator size="small" color={colors.violet} /> : null}
        </View>
      </View>

      <View style={styles.searchResultsWrap}>
        {searchResults.map((user) => (
          <TouchableOpacity
            key={user._id}
            style={[styles.searchResultItem, { backgroundColor: colors.elevated, borderColor: colors.card }]}
            onPress={() => addSelectedMember(user)}
            activeOpacity={0.85}
          >
            <View style={[styles.memberAvatar, { backgroundColor: colors.violet }]}> 
              <Text style={styles.memberAvatarText}>{getInitials(user.name, user.email)}</Text>
            </View>
            <View style={styles.searchResultTextWrap}>
              <Text style={[styles.searchResultName, { color: colors.text }]} numberOfLines={1}>
                {user.name || 'Unnamed User'}
              </Text>
              <Text style={[styles.searchResultEmail, { color: colors.icon }]} numberOfLines={1}>
                {user.email}
              </Text>
            </View>
            <Ionicons name="add-circle" size={22} color={colors.violet} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.container, { backgroundColor: colors.background }]}> 
        <View style={[styles.header, { borderBottomColor: colors.elevated }]}> 
          <TouchableOpacity onPress={handleBack} activeOpacity={0.75}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Create Group</Text>
          <Text style={[styles.stepCounter, { color: colors.icon }]}>{step}/3</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.elevated }]}> 
          <TouchableOpacity
            style={[styles.footerButton, { backgroundColor: colors.card }]}
            onPress={handleBack}
            disabled={submitting}
          >
            <Text style={[styles.footerButtonText, { color: colors.text }]}>{step === 1 ? 'Cancel' : 'Back'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.footerButton, styles.primaryButton, { backgroundColor: colors.violet }]}
            onPress={
              step === 1
                ? () => setStep(2)
                : step === 2
                  ? () => setStep(3)
                  : handleCreateGroup
            }
            disabled={
              submitting ||
              (step === 1 && !canContinueStep1) ||
              (step === 2 && !canContinueStep2)
            }
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {step === 3 ? 'Confirm & Create' : 'Next'}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Syne_700Bold',
  },
  stepCounter: {
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Syne_700Bold',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    marginBottom: 18,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  typeCard: {
    width: '48%',
    minHeight: 96,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  typeEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
  },
  fieldWrap: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontFamily: 'DMSans_700Bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
  },
  multiline: {
    textAlignVertical: 'top',
    minHeight: 92,
  },
  emojiRow: {
    paddingRight: 8,
  },
  emojiChip: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  emojiChipText: {
    fontSize: 24,
  },
  budgetWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyText: {
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
    marginRight: 6,
  },
  budgetInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
  },
  hintText: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
  },
  memberRow: {
    paddingRight: 10,
  },
  memberPill: {
    maxWidth: 180,
    marginRight: 10,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(124, 92, 252, 0.12)',
    gap: 6,
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'DMSans_700Bold',
  },
  memberPillText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
  searchInputWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
  },
  searchResultsWrap: {
    gap: 10,
    paddingBottom: 20,
  },
  searchResultItem: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchResultTextWrap: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
  },
  searchResultEmail: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    gap: 10,
  },
  footerButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonText: {
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
  },
  primaryButton: {
    opacity: 1,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
  },
});
