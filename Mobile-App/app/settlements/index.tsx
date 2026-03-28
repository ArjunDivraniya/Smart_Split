import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ExpoLinking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import SettlementHeader from '@/src/components/settlements/SettlementHeader';
import StatusFilterBar from '@/src/components/settlements/StatusFilterBar';
import ViewToggle from '@/src/components/settlements/ViewToggle';
import CombinedView from '@/src/components/settlements/CombinedView';
import ByGroupView from '@/src/components/settlements/ByGroupView';
import PartialPayModal from '@/src/components/settlements/PartialPayModal';
import { useSettlements } from '@/src/hooks/useSettlements';
import { Settlement } from '@/src/types/settlement.types';
import { useAuth } from '@/src/context';
import { ErrorState } from '@/components/ErrorState';
import { hapticImpactLight } from '@/src/utils/haptics';

const FALLBACK_SUMMARY = {
  totalYouOwe: 0,
  totalYouGet: 0,
  netBalance: 0,
  pendingCount: 0,
  overdueCount: 0,
  partialCount: 0,
};

const isPersistedSettlementId = (id?: string): boolean => /^[a-f\d]{24}$/i.test(String(id || ''));

const buildSettlementDeepLink = (
  settlement: Settlement,
  recipientDirection: 'you_owe' | 'they_owe'
): string => {
  const queryParams: Record<string, string> = {
    friendId: settlement.friend.id,
    direction: recipientDirection,
    action: recipientDirection === 'you_owe' ? 'pay' : 'view',
  };

  if (settlement.group?.id) {
    queryParams.groupId = settlement.group.id;
  }

  return ExpoLinking.createURL('/settlements', { queryParams });
};

const appendDeepLinkToWhatsAppUrl = (whatsappUrl: string, deepLink: string): string => {
  try {
    const parsed = new URL(whatsappUrl);
    const existingText = parsed.searchParams.get('text') || '';
    const withLink = existingText
      ? `${existingText}\n\nOpen in SmartSplit: ${deepLink}`
      : `Open in SmartSplit: ${deepLink}`;
    parsed.searchParams.set('text', withLink);
    return parsed.toString();
  } catch {
    return whatsappUrl;
  }
};

export default function SettlementsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    friendId?: string;
    direction?: string;
    action?: string;
    filter?: string;
  }>();
  const { user } = useAuth();

  const {
    summary,
    settlements,
    loading,
    error,
    activeFilter,
    activeView,
    activeDirection,
    filteredSettlements,
    groupedByGroup,
    setActiveFilter,
    setActiveView,
    setActiveDirection,
    fetchSettlements,
    settlePartial,
    remindFriend,
    markReceived,
  } = useSettlements();

  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [partialVisible, setPartialVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const hasHandledDeepLinkRef = useRef(false);

  const refreshSettlements = async () => {
    setRefreshing(true);
    void hapticImpactLight();
    await fetchSettlements();
    setRefreshing(false);
  };

  const deepLinkFriendId = String(params.friendId || '').trim();

  const currentUserId = String(
    (user as any)?.id || (user as any)?._id || (user as any)?.userId || ''
  );

  const counts = useMemo(() => {
    const pending = settlements.filter((item) => item.status === 'pending').length;
    const overdue = settlements.filter((item) => item.status === 'overdue').length;
    const partial = settlements.filter((item) => item.status === 'partial').length;
    const done = settlements.filter((item) => item.status === 'completed').length;

    return {
      all: settlements.length,
      pending,
      overdue,
      partial,
      done,
    };
  }, [settlements]);

  useEffect(() => {
    const directionParam = String(params.direction || '').trim();
    if (directionParam === 'you_owe' || directionParam === 'they_owe' || directionParam === 'all') {
      setActiveDirection(directionParam as 'all' | 'you_owe' | 'they_owe');
    }

    const filterParam = String(params.filter || '').trim();
    if (filterParam === 'all' || filterParam === 'pending' || filterParam === 'overdue' || filterParam === 'partial') {
      setActiveFilter(filterParam as any);
    }
  }, [params.direction, params.filter, setActiveDirection, setActiveFilter]);

  const linkFilteredSettlements = useMemo(() => {
    if (!deepLinkFriendId) {
      return filteredSettlements;
    }

    return filteredSettlements.filter((item) => item.friend.id === deepLinkFriendId);
  }, [deepLinkFriendId, filteredSettlements]);

  const linkGroupedByGroup = useMemo(() => {
    return linkFilteredSettlements.reduce<Record<string, Settlement[]>>((acc, settlement) => {
      const key = settlement.group?.id || 'direct';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(settlement);
      return acc;
    }, {});
  }, [linkFilteredSettlements]);

  useEffect(() => {
    if (hasHandledDeepLinkRef.current || loading) {
      return;
    }

    const action = String(params.action || '').trim();
    if (action !== 'pay') {
      hasHandledDeepLinkRef.current = true;
      return;
    }

    const payable = linkFilteredSettlements.find(
      (item) => item.direction === 'you_owe' && item.status !== 'completed'
    );

    hasHandledDeepLinkRef.current = true;
    if (payable) {
      handlePayNow(payable);
    }
  }, [loading, params.action, linkFilteredSettlements]);

  const handleSettleAll = () => {
    router.push('/(tabs)/friends' as any);
  };

  const handlePayNow = (settlement: Settlement) => {
    router.push({
      pathname: '/friends/settle' as any,
      params: {
        id: settlement.group?.id || '',
        settlementId: settlement.id,
        friendId: settlement.friend.id,
        friendName: settlement.friend.name,
        amount: String(settlement.remaining || settlement.amount),
        direction: settlement.direction,
        groupId: settlement.group?.id || '',
      },
    });
  };

  const handlePayPartial = (settlement: Settlement) => {
    if (!isPersistedSettlementId(settlement.id)) {
      Alert.alert(
        'Record payment',
        'This item is from an outstanding balance. Record a payment first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => handlePayNow(settlement) },
        ]
      );
      return;
    }

    setSelectedSettlement(settlement);
    setPartialVisible(true);
  };

  const handleShare = async (settlement: Settlement) => {
    const amount = Number(settlement.remaining || settlement.amount || 0).toFixed(2);
    const groupName = settlement.group?.name || 'Personal';
    const recipientDirection = settlement.direction === 'you_owe' ? 'they_owe' : 'you_owe';
    const deepLink = buildSettlementDeepLink(settlement, recipientDirection);
    const message =
      settlement.direction === 'you_owe'
        ? `Hi ${settlement.friend.name}, I still owe you Rs ${amount} for ${groupName}. I will settle this soon.\n\nOpen in SmartSplit: ${deepLink}`
        : `Hi ${settlement.friend.name}, this is a reminder that you owe me Rs ${amount} for ${groupName}. Please settle when possible.\n\nOpen in SmartSplit: ${deepLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    const canOpen = await Linking.canOpenURL(whatsappUrl);
    if (!canOpen) {
      Alert.alert('Unable to open WhatsApp', 'Please check if WhatsApp is installed.');
      return;
    }

    await Linking.openURL(whatsappUrl);
  };

  const handleRemind = async (settlement: Settlement) => {
    if (!isPersistedSettlementId(settlement.id)) {
      await handleShare(settlement);
      return;
    }

    const reminder = await remindFriend(settlement.id);
    if (!reminder?.whatsappUrl) {
      return;
    }

    const recipientDirection = settlement.direction === 'you_owe' ? 'they_owe' : 'you_owe';
    const deepLink = buildSettlementDeepLink(settlement, recipientDirection);
    const whatsappWithLink = appendDeepLinkToWhatsAppUrl(reminder.whatsappUrl, deepLink);

    const canOpen = await Linking.canOpenURL(whatsappWithLink);
    if (canOpen) {
      await Linking.openURL(whatsappWithLink);
      return;
    }

    Alert.alert('Unable to open WhatsApp', 'Please check if WhatsApp is installed.');
  };

  const handleMarkReceived = (settlement: Settlement) => {
    if (!isPersistedSettlementId(settlement.id)) {
      Alert.alert(
        'Cannot mark received yet',
        'This item does not have a payment record yet. Ask your friend to record payment first.'
      );
      return;
    }

    Alert.alert(
      'Confirm Received',
      `Mark ${settlement.friend.name}'s payment as received?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'default',
          onPress: async () => {
            await markReceived(settlement.id);
          },
        },
      ]
    );
  };

  const handleClosePartial = () => {
    setPartialVisible(false);
    setSelectedSettlement(null);
  };

  const handleConfirmPartial = async (data: {
    amountPaid: number;
    method: 'cash' | 'upi' | 'bank';
    note?: string;
  }) => {
    if (!selectedSettlement) {
      return;
    }

    const updated = await settlePartial(selectedSettlement.id, data);
    if (!updated) {
      Alert.alert('Update failed', 'Partial payment could not be saved. Please try again.');
      return;
    }

    handleClosePartial();
  };

  if (loading && settlements.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name='chevron-back' size={22} color='#F3F3FF' />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settlements</Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        <View style={styles.skeletonWrap}>
          <View style={styles.skeletonHeader} />
          <View style={styles.skeletonFilterRow}>
            <View style={styles.skeletonPill} />
            <View style={styles.skeletonPill} />
            <View style={styles.skeletonPill} />
          </View>
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonCard} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name='chevron-back' size={22} color='#F3F3FF' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settlements</Text>
        <View style={styles.backBtnPlaceholder} />
      </View>

      <View style={styles.contentContainer}>
        <SettlementHeader summary={summary || FALLBACK_SUMMARY} onSettleAll={handleSettleAll} />

        <StatusFilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={counts}
        />

        <ViewToggle
          activeView={activeView}
          onViewChange={setActiveView}
          activeDirection={activeDirection}
          onDirectionChange={setActiveDirection}
        />

        <View style={styles.viewWrap}>
          {error && settlements.length === 0 ? (
            <ErrorState onRetry={refreshSettlements} />
          ) : null}

          {!error || settlements.length > 0 ? (activeView === 'combined' ? (
            <CombinedView
              settlements={linkFilteredSettlements}
              activeFilter={activeFilter}
              currentUserId={currentUserId}
              refreshing={refreshing}
              onRefresh={refreshSettlements}
              onPayNow={handlePayNow}
              onPayPartial={handlePayPartial}
              onShare={handleShare}
              onRemind={handleRemind}
              onMarkReceived={handleMarkReceived}
            />
          ) : (
            <ByGroupView
              groupedSettlements={linkGroupedByGroup}
              currentUserId={currentUserId}
              refreshing={refreshing}
              onRefresh={refreshSettlements}
              onPayNow={handlePayNow}
              onPayPartial={handlePayPartial}
              onShare={handleShare}
              onRemind={handleRemind}
              onMarkReceived={handleMarkReceived}
            />
          )) : null}
        </View>
      </View>

      <PartialPayModal
        visible={partialVisible}
        onClose={handleClosePartial}
        settlement={selectedSettlement}
        onConfirm={handleConfirmPartial}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A2B',
  },
  backBtnPlaceholder: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    color: '#F3F3FF',
    fontFamily: 'Syne_700Bold',
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    gap: 14,
  },
  viewWrap: {
    flex: 1,
    minHeight: 320,
  },
  skeletonWrap: {
    padding: 16,
    gap: 14,
  },
  skeletonHeader: {
    height: 112,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  skeletonFilterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  skeletonPill: {
    width: 86,
    height: 34,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  skeletonCard: {
    height: 132,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});
