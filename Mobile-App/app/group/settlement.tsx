import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService } from '@/src/services/api';
import { showInfoToast, showSuccessToast } from '@/src/utils/toast';

interface Suggestion {
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  toUserName: string;
  amount: number;
}

interface GroupMember {
  id: string;
  name: string;
  upiId?: string;
}

const SUCCESS_DURATION_MS = 1500;

export default function SettlementScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const successOpacity = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.72)).current;

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const [fromUserId, setFromUserId] = useState('');
  const [toUserId, setToUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash' | 'bank'>('upi');
  const [note, setNote] = useState('');

  const fromUser = useMemo(() => members.find((m) => m.id === fromUserId), [members, fromUserId]);
  const toUser = useMemo(() => members.find((m) => m.id === toUserId), [members, toUserId]);

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [userRes, groupRes, settleRes] = await Promise.all([
          apiService.user.getMe(),
          apiService.groups.getById(String(groupId || '')),
          apiService.groups.getSettlements(String(groupId || '')),
        ]);

        const userData = userRes?.data?.data || userRes?.data || {};
        const me = userData?.user || userData;
        const meId = String(me?._id || me?.id || '');

        setCurrentUserId(meId);
        setFromUserId(meId);

        const group = groupRes?.data?.data || groupRes?.data || {};
        const creator = typeof group.createdBy === 'object' ? group.createdBy : null;

        const allMembers: GroupMember[] = [];

        if (creator?._id) {
          allMembers.push({
            id: String(creator._id),
            name: creator.name || 'Creator',
            upiId: creator.upiId || creator?.paymentPreferences?.upiId,
          });
        }

        (group.members || []).forEach((member: any) => {
          const id = String(typeof member.userId === 'object' ? member.userId._id : member.userId || '');
          if (!id || allMembers.some((m) => m.id === id)) {
            return;
          }

          allMembers.push({
            id,
            name: member.userName || member.userId?.name || 'Member',
            upiId: member?.userId?.upiId || member?.userId?.paymentPreferences?.upiId,
          });
        });

        setMembers(allMembers);

        const settlementData = settleRes?.data?.data || {};
        const optimized = Array.isArray(settlementData.optimized) ? settlementData.optimized : [];

        const normalizedSuggestions: Suggestion[] = optimized
          .map((item: any) => {
            const fromUserId = String(item.fromUserId || item.from || '');
            const toUserId = String(item.toUserId || item.to || '');
            const amount = Number(item.amount || 0);

            const fromUserName =
              item.fromUserName || allMembers.find((m) => m.id === fromUserId)?.name || 'Member';
            const toUserName =
              item.toUserName || allMembers.find((m) => m.id === toUserId)?.name || 'Member';

            return {
              fromUserId,
              toUserId,
              fromUserName,
              toUserName,
              amount,
            };
          })
          .filter((item: Suggestion) => item.fromUserId && item.toUserId && item.amount > 0);

        setSuggestions(normalizedSuggestions);

        const mySuggestion = normalizedSuggestions.find(
          (item) => item.fromUserId === meId || item.toUserId === meId
        );

        if (mySuggestion) {
          setFromUserId(mySuggestion.fromUserId);
          setToUserId(mySuggestion.toUserId);
          setAmount(String(mySuggestion.amount.toFixed(2)));
          return;
        }

        if (normalizedSuggestions[0]) {
          setFromUserId(normalizedSuggestions[0].fromUserId);
          setToUserId(normalizedSuggestions[0].toUserId);
          setAmount(String(normalizedSuggestions[0].amount.toFixed(2)));
          return;
        }

        const defaultTo = allMembers.find((member) => member.id !== meId);
        if (defaultTo) {
          setToUserId(defaultTo.id);
        }
      } catch {
        Alert.alert('Error', 'Failed to load settlement data.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [groupId, router]);

  React.useEffect(() => {
    if (toUserId && fromUserId === toUserId) {
      const fallback = members.find((member) => member.id !== fromUserId);
      setToUserId(fallback?.id || '');
    }
  }, [fromUserId, toUserId, members]);

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setFromUserId(suggestion.fromUserId);
    setToUserId(suggestion.toUserId);
    setAmount(String(suggestion.amount.toFixed(2)));
    setNote(`Settlement via ${paymentMethod.toUpperCase()}`);
  };

  const canSubmit =
    !!fromUserId &&
    !!toUserId &&
    fromUserId !== toUserId &&
    Number(amount) > 0 &&
    !submitting;

  const copyUpiId = async () => {
    if (!toUser?.upiId) {
      return;
    }

    try {
      await Clipboard.setStringAsync(toUser.upiId);
      showInfoToast('📋 UPI ID copied');
      Alert.alert('Copied', `${toUser.name}'s UPI ID copied.`);
    } catch {
      Alert.alert('UPI ID', toUser.upiId);
    }
  };

  const showSuccessAnimation = () => {
    setShowSuccess(true);
    successOpacity.setValue(0);
    successScale.setValue(0.72);

    Animated.parallel([
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(successScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 110,
      }),
    ]).start(() => {
      Animated.timing(successOpacity, {
        toValue: 0,
        duration: 220,
        delay: SUCCESS_DURATION_MS - 400,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setShowSuccess(false);
        router.back();
      });
    });
  };

  const confirmSettlement = async () => {
    if (!canSubmit) {
      return;
    }

    try {
      setSubmitting(true);

      await apiService.groups.recordSettlement(String(groupId || ''), {
        fromUserId,
        toUserId,
        amount: Number(amount),
        note: `${paymentMethod.toUpperCase()}${note ? ` - ${note}` : ''}`,
      });

      showSuccessToast('✅ Settled up!');
      showSuccessAnimation();
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error || 'Failed to record settlement.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.violet} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { borderBottomColor: colors.elevated }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settle Up</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settlement Suggestions</Text>
          <Text style={[styles.sectionHint, { color: colors.icon }]}>Minimum-cash-flow optimization</Text>

          {suggestions.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.icon }]}>Everyone is already settled.</Text>
          ) : (
            suggestions.map((item, index) => {
              const involvesMe = item.fromUserId === currentUserId || item.toUserId === currentUserId;

              const title =
                item.fromUserId === currentUserId
                  ? `You pay ${item.toUserName} ₹${item.amount.toFixed(2)}`
                  : item.toUserId === currentUserId
                  ? `${item.fromUserName} pays you ₹${item.amount.toFixed(2)}`
                  : `${item.fromUserName} pays ${item.toUserName} ₹${item.amount.toFixed(2)}`;

              const isSelected =
                fromUserId === item.fromUserId &&
                toUserId === item.toUserId &&
                Number(amount || 0).toFixed(2) === item.amount.toFixed(2);

              return (
                <TouchableOpacity
                  key={`${item.fromUserId}-${item.toUserId}-${index}`}
                  style={[
                    styles.suggestionCard,
                    {
                      backgroundColor: colors.background,
                      borderColor: isSelected ? colors.mint : colors.elevated,
                    },
                  ]}
                  onPress={() => handleSelectSuggestion(item)}
                >
                  <Ionicons name="swap-horizontal" size={16} color={involvesMe ? colors.violet : colors.icon} />
                  <View style={styles.suggestionTextWrap}>
                    <Text style={[styles.suggestionText, { color: colors.text }]}>{title}</Text>
                    {involvesMe ? <Text style={[styles.suggestionMeta, { color: colors.mint }]}>Tap to prefill</Text> : null}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.elevated }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settlement Form</Text>

          <View style={styles.rowLine}>
            <Text style={[styles.label, { color: colors.icon }]}>From</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toChipsWrap}>
              {members.map((member) => {
                const selected = fromUserId === member.id;
                return (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.toChip,
                      {
                        backgroundColor: selected ? `${colors.violet}22` : colors.background,
                        borderColor: selected ? colors.violet : colors.elevated,
                      },
                    ]}
                    onPress={() => setFromUserId(member.id)}
                  >
                    <Text style={[styles.toChipText, { color: selected ? colors.violet : colors.text }]}>
                      {member.id === currentUserId ? 'You' : member.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.rowLine}>
            <Text style={[styles.label, { color: colors.icon }]}>To</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toChipsWrap}>
              {members
                .filter((member) => member.id !== fromUserId)
                .map((member) => {
                  const selected = toUserId === member.id;
                  return (
                    <TouchableOpacity
                      key={member.id}
                      style={[
                        styles.toChip,
                        {
                          backgroundColor: selected ? `${colors.violet}22` : colors.background,
                          borderColor: selected ? colors.violet : colors.elevated,
                        },
                      ]}
                      onPress={() => setToUserId(member.id)}
                    >
                      <Text style={[styles.toChipText, { color: selected ? colors.violet : colors.text }]}> 
                        {member.id === currentUserId ? 'You' : member.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: colors.icon }]}>Amount</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={colors.icon}
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.elevated,
                  backgroundColor: colors.background,
                },
              ]}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: colors.icon }]}>Payment Method</Text>
            <View style={styles.methodRow}>
              {([
                { key: 'upi', label: 'UPI' },
                { key: 'cash', label: 'Cash' },
                { key: 'bank', label: 'Bank' },
              ] as const).map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.methodBtn,
                    {
                      backgroundColor: paymentMethod === item.key ? `${colors.mint}22` : colors.background,
                      borderColor: paymentMethod === item.key ? colors.mint : colors.elevated,
                    },
                  ]}
                  onPress={() => setPaymentMethod(item.key)}
                >
                  <Text style={[styles.methodText, { color: paymentMethod === item.key ? colors.mint : colors.text }]}> 
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {paymentMethod === 'upi' && toUser?.upiId ? (
            <View style={[styles.upiBox, { backgroundColor: colors.background, borderColor: colors.elevated }]}>
              <Text style={[styles.upiText, { color: colors.text }]}>{toUser.upiId}</Text>
              <TouchableOpacity onPress={copyUpiId} style={[styles.copyBtn, { borderColor: colors.elevated }]}>
                <Ionicons name="copy-outline" size={14} color={colors.violet} />
                <Text style={[styles.copyBtnText, { color: colors.violet }]}>Copy</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.fieldWrap}>
            <Text style={[styles.label, { color: colors.icon }]}>Note</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Optional note"
              placeholderTextColor={colors.icon}
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.elevated,
                  backgroundColor: colors.background,
                },
              ]}
            />
          </View>

          <Text style={[styles.helperText, { color: colors.icon }]}>
            {fromUser?.name || 'From'} {'->'} {toUser?.name || 'To'}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.elevated }]}>
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: canSubmit ? '#1AB26B' : colors.elevated }]}
          onPress={confirmSettlement}
          disabled={!canSubmit}
        >
          {submitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.confirmBtnText}>Confirm Settlement</Text>}
        </TouchableOpacity>
      </View>

      {showSuccess ? (
        <Animated.View style={[styles.successOverlay, { opacity: successOpacity }]}>
          <Animated.View style={[styles.successIconWrap, { transform: [{ scale: successScale }] }]}> 
            <Ionicons name="checkmark" size={64} color="#16A34A" />
          </Animated.View>
          <Animated.Text style={[styles.successTitle, { opacity: successOpacity }]}>Settled!</Animated.Text>
          <Animated.Text style={[styles.successSubtitle, { opacity: successOpacity }]}>Balances updated successfully</Animated.Text>
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Syne_700Bold',
    fontWeight: '700',
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 30,
  },
  section: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'DMSans_700Bold',
  },
  sectionHint: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },
  suggestionCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suggestionTextWrap: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 13,
    flex: 1,
  },
  suggestionMeta: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: 'DMSans_600SemiBold',
  },
  emptyText: {
    fontSize: 13,
  },
  rowLine: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
  },
  toChipsWrap: {
    gap: 8,
    paddingRight: 12,
  },
  toChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toChipText: {
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  fieldWrap: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  methodText: {
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
  },
  upiBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  upiText: {
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  copyBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyBtnText: {
    fontSize: 11,
    fontFamily: 'DMSans_700Bold',
  },
  helperText: {
    fontSize: 12,
  },
  footer: {
    borderTopWidth: 1,
    padding: 16,
  },
  confirmBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
    color: '#ffffff',
    fontFamily: 'DMSans_700Bold',
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 120,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    marginTop: 18,
    fontSize: 30,
    color: '#ffffff',
    fontFamily: 'DMSans_700Bold',
  },
  successSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#E8FFF2',
    fontFamily: 'DMSans_600SemiBold',
  },
});
