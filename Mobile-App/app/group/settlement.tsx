import React, { useMemo, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
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
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService } from '@/src/services/api';

interface Suggestion {
  from: string;
  to: string;
  amount: number;
  fromName: string;
  toName: string;
}

interface GroupMember {
  id: string;
  name: string;
  upiId?: string;
}

export default function SettlementScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successScale = useRef(new Animated.Value(0.6)).current;

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const [toUserId, setToUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash' | 'bank'>('upi');
  const [note, setNote] = useState('');

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
        const named: Suggestion[] = optimized.map((s: any) => {
          const from = String(s.from || '');
          const to = String(s.to || '');
          const fromName = allMembers.find((m) => m.id === from)?.name || 'Member';
          const toName = allMembers.find((m) => m.id === to)?.name || 'Member';
          return {
            from,
            to,
            fromName,
            toName,
            amount: Number(s.amount || 0),
          };
        }).filter((s: Suggestion) => s.amount > 0);

        setSuggestions(named);

        const mySuggestion = named.find((s) => s.from === meId || s.to === meId);
        if (mySuggestion) {
          if (mySuggestion.from === meId) {
            setToUserId(mySuggestion.to);
          } else {
            setToUserId(mySuggestion.from);
          }
          setAmount(String(mySuggestion.amount.toFixed(2)));
        } else {
          const defaultTo = allMembers.find((m) => m.id !== meId);
          if (defaultTo) {
            setToUserId(defaultTo.id);
          }
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

  const handleSelectSuggestion = (s: Suggestion) => {
    if (s.from === currentUserId) {
      setToUserId(s.to);
      setAmount(String(s.amount.toFixed(2)));
      setNote(`Settlement with ${s.toName}`);
    } else if (s.to === currentUserId) {
      setToUserId(s.from);
      setAmount(String(s.amount.toFixed(2)));
      setNote(`Settlement with ${s.fromName}`);
    }
  };

  const canSubmit = !!toUserId && Number(amount) > 0 && !submitting;

  const copyUpiId = async () => {
    if (!toUser?.upiId) {
      return;
    }
    Alert.alert('UPI ID', `Copy this UPI ID: ${toUser.upiId}`);
  };

  const confirmSettlement = async () => {
    if (!canSubmit) {
      return;
    }

    try {
      setSubmitting(true);
      await apiService.groups.recordSettlement(String(groupId || ''), {
        fromUserId: currentUserId,
        toUserId,
        amount: Number(amount),
        note: `${paymentMethod.toUpperCase()}${note ? ` - ${note}` : ''}`,
      });

      setShowSuccess(true);
      successScale.setValue(0.6);
      Animated.spring(successScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
      }).start();

      setTimeout(() => {
        setShowSuccess(false);
        router.back();
      }, 1500);
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
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.elevated }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settlement Suggestions</Text>
          {suggestions.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.icon }]}>Everyone is already settled.</Text>
          ) : (
            suggestions.map((s, idx) => {
              const isMeFrom = s.from === currentUserId;
              const text = isMeFrom
                ? `You pay ${s.toName} ₹${s.amount.toFixed(2)}`
                : s.to === currentUserId
                ? `${s.fromName} pays you ₹${s.amount.toFixed(2)}`
                : `${s.fromName} pays ${s.toName} ₹${s.amount.toFixed(2)}`;

              return (
                <TouchableOpacity
                  key={`${s.from}-${s.to}-${idx}`}
                  style={[styles.suggestionCard, { backgroundColor: colors.background, borderColor: colors.elevated }]}
                  onPress={() => handleSelectSuggestion(s)}
                >
                  <Ionicons name="swap-horizontal" size={16} color={colors.violet} />
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{text}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.elevated }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settlement Form</Text>

          <View style={styles.rowLine}>
            <Text style={[styles.label, { color: colors.icon }]}>From</Text>
            <Text style={[styles.valueText, { color: colors.text }]}>You</Text>
          </View>

          <View style={styles.rowLine}>
            <Text style={[styles.label, { color: colors.icon }]}>To</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toChipsWrap}>
              {members
                .filter((m) => m.id !== currentUserId)
                .map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.toChip,
                      {
                        backgroundColor: toUserId === m.id ? `${colors.violet}22` : colors.background,
                        borderColor: toUserId === m.id ? colors.violet : colors.elevated,
                      },
                    ]}
                    onPress={() => setToUserId(m.id)}
                  >
                    <Text style={[styles.toChipText, { color: toUserId === m.id ? colors.violet : colors.text }]}>{m.name}</Text>
                  </TouchableOpacity>
                ))}
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
              style={[styles.input, { color: colors.text, borderColor: colors.elevated, backgroundColor: colors.background }]}
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
                  <Text style={[styles.methodText, { color: paymentMethod === item.key ? colors.mint : colors.text }]}>{item.label}</Text>
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
              style={[styles.input, { color: colors.text, borderColor: colors.elevated, backgroundColor: colors.background }]}
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.elevated }]}> 
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: canSubmit ? colors.mint : colors.elevated }]}
          onPress={confirmSettlement}
          disabled={!canSubmit}
        >
          {submitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.confirmBtnText}>Confirm Settlement</Text>}
        </TouchableOpacity>
      </View>

      {showSuccess ? (
        <View style={styles.successOverlay}>
          <Animated.View style={[styles.successCard, { transform: [{ scale: successScale }] }]}> 
            <Ionicons name="checkmark-circle" size={82} color="#22C55E" />
            <Text style={styles.successText}>Settlement Completed</Text>
          </Animated.View>
        </View>
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
    fontSize: 17,
    fontFamily: 'DMSans_700Bold',
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
  suggestionText: {
    fontSize: 13,
    flex: 1,
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
  valueText: {
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
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
  footer: {
    borderTopWidth: 1,
    padding: 16,
  },
  confirmBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
    color: '#ffffff',
    fontFamily: 'DMSans_700Bold',
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCard: {
    width: 220,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    padding: 20,
    alignItems: 'center',
  },
  successText: {
    marginTop: 8,
    fontSize: 16,
    color: '#16A34A',
    fontFamily: 'DMSans_700Bold',
  },
});
