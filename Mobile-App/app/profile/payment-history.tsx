import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  Share,
  FlatList,
  SectionList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { apiService } from '@/src/services/api';

const COLORS = {
  void: '#080810',
  surface: '#0F0F1A',
  card: '#14141F',
  elevated: '#1A1A2B',
  violet: '#7C5CFC',
  violetLight: '#9B7FFF',
  violetDim: 'rgba(124, 92, 252, 0.06)',
  mint: '#00E5B0',
  coral: '#FF5F7E',
  amber: '#FFB547',
  sky: '#38BDF8',
  textPrimary: '#F0F0FF',
  textSecondary: '#A0A0BF',
  textMuted: '#80809E',
  border: 'rgba(255, 255, 255, 0.08)',
};

type PaymentStatus = 'sent' | 'received' | 'failed';

interface Payment {
  id: string;
  status: PaymentStatus;
  friendName: string;
  amount: number;
  currency: string;
  groupName: string;
  paymentMethod: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  timestamp: string;
  date: Date;
  errorMessage?: string;
}

interface PaymentHistory {
  title: string;
  data: Payment[];
}

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'all' | PaymentStatus>('all');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Load payment history
  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      // Fetch payment history from backend
      // Note: This endpoint should be added to apiService if not already present
      const response = await (apiService as any).settlement?.getPaymentHistory?.() || 
                      { data: { success: true, data: [] } };

      if (response?.data?.success) {
        const paymentData = response.data.data || [];
        const formattedPayments = paymentData.map((payment: any) => ({
          id: payment._id || payment.id,
          status: payment.status as PaymentStatus,
          friendName: payment.friendName || 'Unknown Friend',
          amount: payment.amount || 0,
          currency: payment.currency || '₹',
          groupName: payment.groupName || 'Personal',
          paymentMethod: payment.paymentMethod || 'UPI',
          razorpayPaymentId: payment.razorpayPaymentId || '',
          razorpayOrderId: payment.razorpayOrderId || '',
          timestamp: payment.timestamp || payment.createdAt,
          date: new Date(payment.timestamp || payment.createdAt),
          errorMessage: payment.errorMessage,
        }));

        setPayments(formattedPayments);
      }
    } catch (error: any) {
      console.error('Error loading payment history:', error);
      Alert.alert('Error', 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  // Filter payments based on selected tab
  const filteredPayments = useMemo(() => {
    if (selectedTab === 'all') {
      return payments;
    }
    return payments.filter((payment) => payment.status === selectedTab);
  }, [payments, selectedTab]);

  // Group payments by month
  const groupedPayments = useMemo(() => {
    const grouped: { [key: string]: Payment[] } = {};

    filteredPayments
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .forEach((payment) => {
        const monthKey = payment.date.toLocaleDateString('en-IN', {
          month: 'long',
          year: 'numeric',
        });

        if (!grouped[monthKey]) {
          grouped[monthKey] = [];
        }
        grouped[monthKey].push(payment);
      });

    return Object.entries(grouped).map(([title, data]) => ({
      title,
      data,
    }));
  }, [filteredPayments]);

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'sent':
        return '✅';
      case 'received':
        return '📥';
      case 'failed':
        return '❌';
      default:
        return '•';
    }
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'sent':
        return `${COLORS.violet}20`;
      case 'received':
        return `${COLORS.mint}20`;
      case 'failed':
        return `${COLORS.coral}20`;
      default:
        return COLORS.elevated;
    }
  };

  const getStatusBorderColor = (status: PaymentStatus) => {
    switch (status) {
      case 'sent':
        return `${COLORS.violet}40`;
      case 'received':
        return `${COLORS.mint}40`;
      case 'failed':
        return `${COLORS.coral}40`;
      default:
        return COLORS.border;
    }
  };

  const handleSharePaymentProof = async () => {
    if (!selectedPayment) return;

    try {
      const proofText = `SmartSplit Payment Proof\n
Status: ${selectedPayment.status.toUpperCase()}
Amount: ${selectedPayment.currency} ${selectedPayment.amount}
Friend: ${selectedPayment.friendName}
Group: ${selectedPayment.groupName}
Method: ${selectedPayment.paymentMethod}
Order ID: ${selectedPayment.razorpayOrderId}
Payment ID: ${selectedPayment.razorpayPaymentId}
Date: ${selectedPayment.date.toLocaleString('en-IN')}`;

      await Share.share({
        message: proofText,
        title: 'Payment Proof',
      });
    } catch (error) {
      console.error('Error sharing payment proof:', error);
    }
  };

  const renderPaymentCard = ({ item }: { item: Payment }) => (
    <TouchableOpacity
      style={[styles.paymentCard, { backgroundColor: getStatusColor(item.status) }]}
      onPress={() => {
        setSelectedPayment(item);
        setDetailModalVisible(true);
      }}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.cardBorder,
          {
            borderColor: getStatusBorderColor(item.status),
          },
        ]}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.statusSection}>
              <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>
                  {item.status === 'sent' ? 'Sent to' : item.status === 'received' ? 'Received from' : 'Failed to'}{' '}
                  {item.friendName}
                </Text>
                <Text style={styles.groupName}>{item.groupName}</Text>
              </View>
            </View>
            <View style={styles.dateSection}>
              <Text style={styles.date}>
                {item.date.toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>

          <View style={styles.cardDetails}>
            <Text style={styles.amount}>
              {item.currency} {item.amount.toLocaleString('en-IN')}
            </Text>
            <View style={styles.methodSection}>
              <Text style={styles.method}>
                via {item.paymentMethod} · {item.razorpayPaymentId.slice(-8)}
              </Text>
            </View>
          </View>

          {item.status === 'failed' && item.errorMessage && (
            <View style={styles.errorSection}>
              <MaterialIcons name="error-outline" size={14} color={COLORS.coral} />
              <Text style={styles.errorText}>{item.errorMessage}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: PaymentHistory }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionDivider} />
    </View>
  );

  return (
    <>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment History</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {(['all', 'sent', 'received', 'failed'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.tabActive]}
              onPress={() => setSelectedTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Payment List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.violet} />
          </View>
        ) : filteredPayments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No payments yet</Text>
            <Text style={styles.emptyDescription}>
              Your {selectedTab !== 'all' ? selectedTab : 'payment'} history will appear here
            </Text>
          </View>
        ) : (
          <SectionList
            sections={groupedPayments}
            keyExtractor={(item) => item.id}
            renderItem={renderPaymentCard}
            renderSectionHeader={renderSectionHeader}
            scrollEnabled
            contentContainerStyle={styles.listContent}
            style={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>

      {/* Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay} edges={['top']}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
                hitSlop={12}
              >
                <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Payment Details</Text>
              <TouchableOpacity
                onPress={handleSharePaymentProof}
                hitSlop={12}
              >
                <Ionicons name="share-social" size={20} color={COLORS.violet} />
              </TouchableOpacity>
            </View>

            {selectedPayment && (
              <ScrollView
                style={styles.modalScrollView}
                showsVerticalScrollIndicator={false}
              >
                {/* Status Card */}
                <View
                  style={[
                    styles.detailStatusCard,
                    { backgroundColor: getStatusColor(selectedPayment.status) },
                  ]}
                >
                  <Text style={styles.detailStatusIcon}>
                    {getStatusIcon(selectedPayment.status)}
                  </Text>
                  <Text style={styles.detailStatusText}>
                    {selectedPayment.status === 'sent'
                      ? 'Payment Sent'
                      : selectedPayment.status === 'received'
                        ? 'Payment Received'
                        : 'Payment Failed'}
                  </Text>
                </View>

                {/* Amount Section */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Amount</Text>
                  <Text style={styles.detailAmount}>
                    {selectedPayment.currency} {selectedPayment.amount.toLocaleString('en-IN')}
                  </Text>
                </View>

                {/* Details Section */}
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>From/To</Text>
                    <Text style={styles.detailItemValue}>{selectedPayment.friendName}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Group</Text>
                    <Text style={styles.detailItemValue}>{selectedPayment.groupName}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Payment Method</Text>
                    <Text style={styles.detailItemValue}>{selectedPayment.paymentMethod}</Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Date & Time</Text>
                    <Text style={styles.detailItemValue}>
                      {selectedPayment.date.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                {/* Razorpay Details */}
                <View style={styles.razorpaySection}>
                  <Text style={styles.razorpayTitle}>Payment Proof</Text>

                  <View style={styles.proofItem}>
                    <Text style={styles.proofLabel}>Order ID</Text>
                    <View style={styles.proofValueRow}>
                      <Text style={styles.proofValue}>
                        {selectedPayment.razorpayOrderId}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          Share.share({
                            message: selectedPayment.razorpayOrderId,
                            title: 'Order ID',
                          });
                        }}
                        hitSlop={8}
                      >
                        <Ionicons
                          name="copy"
                          size={16}
                          color={COLORS.violet}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.proofItem}>
                    <Text style={styles.proofLabel}>Payment ID</Text>
                    <View style={styles.proofValueRow}>
                      <Text style={styles.proofValue}>
                        {selectedPayment.razorpayPaymentId}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          Share.share({
                            message: selectedPayment.razorpayPaymentId,
                            title: 'Payment ID',
                          });
                        }}
                        hitSlop={8}
                      >
                        <Ionicons
                          name="copy"
                          size={16}
                          color={COLORS.violet}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Error Section (if failed) */}
                {selectedPayment.status === 'failed' &&
                  selectedPayment.errorMessage && (
                    <View style={styles.errorDetailSection}>
                      <View style={styles.errorHeader}>
                        <MaterialIcons
                          name="error-outline"
                          size={20}
                          color={COLORS.coral}
                        />
                        <Text style={styles.errorDetailTitle}>Error Details</Text>
                      </View>
                      <Text style={styles.errorDetailMessage}>
                        {selectedPayment.errorMessage}
                      </Text>
                    </View>
                  )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleSharePaymentProof}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="share-social" size={18} color={COLORS.violet} />
                    <Text style={styles.actionButtonText}>Share Proof</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonSecondary]}
                    onPress={() => setDetailModalVisible(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionButtonTextSecondary}>Close</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalPadding} />
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.void,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  tabsContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: {
    backgroundColor: COLORS.violet,
    borderColor: COLORS.violet,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.textPrimary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  paymentCard: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  cardBorder: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  cardContent: {
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  statusIcon: {
    fontSize: 20,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  groupName: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
  },
  dateSection: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textMuted,
  },
  cardDetails: {
    gap: 6,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  methodSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  method: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textMuted,
  },
  errorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${COLORS.coral}15`,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 11,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.coral,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.void,
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.elevated,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  modalScrollView: {
    flex: 1,
  },
  detailStatusCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    borderWidth: 1,
  },
  detailStatusIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  detailStatusText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  detailSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailAmount: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  detailsGrid: {
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  detailItem: {
    backgroundColor: COLORS.elevated,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailItemLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailItemValue: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textPrimary,
  },
  razorpaySection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  razorpayTitle: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  proofItem: {
    backgroundColor: COLORS.elevated,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  proofLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  proofValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  proofValue: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textPrimary,
    flex: 1,
  },
  errorDetailSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: `${COLORS.coral}15`,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: `${COLORS.coral}40`,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  errorDetailTitle: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.coral,
  },
  errorDetailMessage: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.violet,
    borderRadius: 10,
    paddingVertical: 12,
    gap: 6,
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textPrimary,
  },
  actionButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textSecondary,
  },
  modalPadding: {
    height: 20,
  },
});
