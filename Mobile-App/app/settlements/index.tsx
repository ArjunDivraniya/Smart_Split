import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SettlementHeader from '@/src/components/settlements/SettlementHeader';
import StatusFilterBar from '@/src/components/settlements/StatusFilterBar';
import ViewToggle from '@/src/components/settlements/ViewToggle';
import CombinedView from '@/src/components/settlements/CombinedView';
import ByGroupView from '@/src/components/settlements/ByGroupView';
import PartialPayModal from '@/src/components/settlements/PartialPayModal';
import { useSettlements } from '@/src/hooks/useSettlements';
import { Settlement } from '@/src/types/settlement.types';
import { useAuth } from '@/src/context';

const FALLBACK_SUMMARY = {
  totalYouOwe: 0,
  totalYouGet: 0,
  netBalance: 0,
  pendingCount: 0,
  overdueCount: 0,
  partialCount: 0,
};

export default function SettlementsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const {
    summary,
    settlements,
    loading,
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
  const refreshSettlements = fetchSettlements;

  const currentUserId = String((user as any)?.id || (user as any)?._id || '');

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
    setSelectedSettlement(settlement);
    setPartialVisible(true);
  };

  const handleRemind = async (settlement: Settlement) => {
    const reminder = await remindFriend(settlement.id);
    if (!reminder?.whatsappUrl) {
      return;
    }

    const canOpen = await Linking.canOpenURL(reminder.whatsappUrl);
    if (canOpen) {
      await Linking.openURL(reminder.whatsappUrl);
      return;
    }

    Alert.alert('Unable to open WhatsApp', 'Please check if WhatsApp is installed.');
  };

  const handleMarkReceived = (settlement: Settlement) => {
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

    await settlePartial(selectedSettlement.id, data);
    handleClosePartial();
  };

  if (loading) {
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

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshSettlements}
            tintColor='#7C5CFC'
          />
        }
        showsVerticalScrollIndicator={false}
      >
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
          {activeView === 'combined' ? (
            <CombinedView
              settlements={filteredSettlements}
              activeFilter={activeFilter}
              currentUserId={currentUserId}
              onPayNow={handlePayNow}
              onPayPartial={handlePayPartial}
              onRemind={handleRemind}
              onMarkReceived={handleMarkReceived}
            />
          ) : (
            <ByGroupView
              groupedSettlements={groupedByGroup}
              currentUserId={currentUserId}
              onPayNow={handlePayNow}
              onPayPartial={handlePayPartial}
              onRemind={handleRemind}
              onMarkReceived={handleMarkReceived}
            />
          )}
        </View>
      </ScrollView>

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
    padding: 16,
    gap: 14,
    paddingBottom: 120,
  },
  viewWrap: {
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
