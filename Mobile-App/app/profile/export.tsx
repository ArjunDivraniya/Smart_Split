import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Share,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { apiService } from '@/src/services/api';

const COLORS = {
  surface: '#0F0F1A',
  elevated: '#1A1A2B',
  violet: '#7C5CFC',
  violetLight: '#9B7FFF',
  mint: '#00E5B0',
  coral: '#FF5F7E',
  amber: '#FFB547',
  textPrimary: '#F0F0FF',
  textSecondary: '#8888AA',
  textMuted: '#55556A',
  border: 'rgba(255, 255, 255, 0.06)',
};

export default function ExportDataScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [exportData, setExportData] = useState<any>(null);

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await apiService.profile.exportData();
      
      if (response.data?.success) {
        const data = response.data.data;
        setExportData(data);

        // Convert to JSON string
        const jsonString = JSON.stringify(data, null, 2);

        // Show success with option to share
        Alert.alert(
          'Export Ready',
          'Your data has been exported successfully. Would you like to share it?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Share',
              onPress: async () => {
                try {
                  await Share.share({
                    message: `SmartSplit Data Export\n\n${jsonString}`,
                  });
                } catch (error) {
                  console.error('Error sharing:', error);
                }
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['rgba(124, 92, 252, 0.15)', 'transparent']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Export Data</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Export Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[COLORS.mint, '#00B894']}
              style={styles.iconGradient}
            >
              <Ionicons name="cloud-download" size={48} color={COLORS.textPrimary} />
            </LinearGradient>
          </View>

          <Text style={styles.title}>Export Your Data</Text>
          <Text style={styles.description}>
            Download all your SmartSplit data including trips, expenses, and settlements in JSON format.
          </Text>

          {/* What's Included Card */}
          <View style={styles.includeCard}>
            <Text style={styles.includeTitle}>What's Included:</Text>
            
            <View style={styles.includeItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.mint} />
              <Text style={styles.includeText}>Personal information</Text>
            </View>
            
            <View style={styles.includeItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.mint} />
              <Text style={styles.includeText}>All trips and groups</Text>
            </View>
            
            <View style={styles.includeItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.mint} />
              <Text style={styles.includeText}>Expense history</Text>
            </View>
            
            <View style={styles.includeItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.mint} />
              <Text style={styles.includeText}>Settlement records</Text>
            </View>
            
            <View style={styles.includeItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.mint} />
              <Text style={styles.includeText}>Category preferences</Text>
            </View>
          </View>

          {/* Export Summary (if data is exported) */}
          {exportData && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Export Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Personal Expenses</Text>
                <Text style={styles.summaryValue}>
                  {exportData.summary?.personalExpenses || 0}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Groups</Text>
                <Text style={styles.summaryValue}>
                  {exportData.summary?.groups || 0}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Friends</Text>
                <Text style={styles.summaryValue}>
                  {exportData.summary?.friends || 0}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Export Date</Text>
                <Text style={styles.summaryValue}>
                  {new Date(exportData.exportDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={COLORS.amber} />
            <Text style={styles.infoText}>
              Your data will be exported in JSON format. You can save it locally or share it securely.
            </Text>
          </View>

          {/* Export Button */}
          <TouchableOpacity
            style={[styles.exportButton, loading && styles.exportButtonDisabled]}
            onPress={handleExport}
            disabled={loading}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[COLORS.mint, '#00B894']}
              style={styles.exportButtonGradient}
            >
              <Ionicons
                name={loading ? 'hourglass' : 'cloud-download-outline'}
                size={20}
                color={COLORS.textPrimary}
              />
              <Text style={styles.exportButtonText}>
                {loading ? 'Exporting...' : 'Export Data as JSON'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Future Feature */}
          <View style={styles.futureCard}>
            <Ionicons name="rocket" size={20} color={COLORS.violetLight} />
            <View style={styles.futureContent}>
              <Text style={styles.futureTitle}>Coming Soon</Text>
              <Text style={styles.futureText}>
                PDF Export • Cloud Backup • Auto-sync
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Syne_800ExtraBold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  includeCard: {
    backgroundColor: COLORS.elevated,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  includeTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  includeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
  },
  summaryCard: {
    backgroundColor: COLORS.elevated,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.mint,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.mint,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
    lineHeight: 18,
  },
  exportButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  exportButtonDisabled: {
    opacity: 0.5,
  },
  exportButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  futureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: `${COLORS.violet}20`,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: `${COLORS.violet}40`,
  },
  futureContent: {
    flex: 1,
  },
  futureTitle: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.violetLight,
    marginBottom: 2,
  },
  futureText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'DMSans_400Regular',
  },
});
