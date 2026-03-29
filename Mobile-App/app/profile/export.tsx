import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Share,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '@/src/services/api';
import { showInfoToast } from '@/src/utils/toast';
import { useBackNavigation } from '@/src/hooks/useBackNavigation';

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

type ExportFormat = 'json' | 'csv' | 'pdf';
type DateRange = 'all' | 'last-month' | 'last-year';

interface ExportData {
  personalExpenses: number;
  groups: number;
  settlements: number;
  budgetSettings: boolean;
}

export default function ExportDataScreen() {
  const router = useRouter();
  const handleBack = useBackNavigation('/profile' as any, undefined, { alwaysUseFallback: true });
  const floatAnim = useRef(new Animated.Value(0)).current;

  // State
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('all');
  const [loading, setLoading] = useState(false);
  const [lastExported, setLastExported] = useState<string>('Never');
  const [exportDataPreview, setExportDataPreview] = useState<ExportData>({
    personalExpenses: 0,
    groups: 0,
    settlements: 0,
    budgetSettings: false,
  });

  // Floating animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  // Load last export time and data preview
  useEffect(() => {
    loadExportMetadata();
  }, []);

  const loadExportMetadata = async () => {
    try {
      // Get last export time
      const lastTime = await AsyncStorage.getItem('last_export_time');
      if (lastTime) {
        const date = new Date(parseInt(lastTime));
        const formatted = date.toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        setLastExported(formatted);
      }

      // Get data preview
      try {
        const profile = await apiService.profile.getProfile();
        if (profile.data?.success) {
          const stats = profile.data.data?.stats || {};
          setExportDataPreview({
            personalExpenses: stats.totalPersonalExpenses || 0,
            groups: stats.totalGroups || 0,
            settlements: 0,
            budgetSettings: true,
          });
        }
      } catch (error) {
        console.error('Error loading export data preview:', error);
      }
    } catch (error) {
      console.error('Error loading export metadata:', error);
    }
  };

  // Convert array of objects to CSV
  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    const csvRows = data.map((row) => {
      return headers
        .map((header) => {
          const value = row[header];
          if (typeof value === 'string') {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  };

  // Generate PDF content (HTML)
  const generatePDFContent = (data: any): string => {
    const timestamp = new Date().toLocaleString('en-IN');

    let content = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 20px;
              background: #f5f5f5;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #7C5CFC;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              color: #7C5CFC;
              font-size: 28px;
            }
            .header p {
              margin: 5px 0 0 0;
              color: #666;
              font-size: 12px;
            }
            .section {
              margin: 20px 0;
              background: white;
              padding: 15px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .section h2 {
              margin: 0 0 15px 0;
              font-size: 16px;
              color: #080810;
              border-bottom: 2px solid #7C5CFC;
              padding-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            th {
              background: #f0f0f0;
              padding: 10px;
              text-align: left;
              font-weight: 600;
              border-bottom: 2px solid #ddd;
            }
            td {
              padding: 8px 10px;
              border-bottom: 1px solid #eee;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin: 15px 0;
            }
            .summary-item {
              background: #f5f5f5;
              padding: 10px 15px;
              border-radius: 6px;
              text-align: center;
            }
            .summary-item .value {
              font-size: 24px;
              font-weight: 700;
              color: #7C5CFC;
            }
            .summary-item .label {
              font-size: 12px;
              color: #666;
              margin-top: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              color: #999;
              font-size: 11px;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>💰 SmartSplit Data Export</h1>
            <p>Exported on ${timestamp}</p>
          </div>
          <div class="section">
            <h2>📊 Export Summary</h2>
            <div class="summary">
              <div class="summary-item">
                <div class="value">${exportDataPreview.personalExpenses}</div>
                <div class="label">Personal Expenses</div>
              </div>
              <div class="summary-item">
                <div class="value">${exportDataPreview.groups}</div>
                <div class="label">Groups</div>
              </div>
            </div>
          </div>
          <div class="footer">
            <p>This is your personal data export from SmartSplit.</p>
            <p>Keep this file safe and private.</p>
          </div>
        </body>
      </html>
    `;

    return content;
  };

  const handleExport = async () => {
    try {
      setLoading(true);

      // Fetch export data from API
      const response = await apiService.profile.exportData();
      let data = response.data?.data || response.data;

      if (!data) {
        Alert.alert('Error', 'Failed to fetch export data');
        setLoading(false);
        return;
      }

      let fileContent = '';
      let fileName = `smartsplit-export-${new Date().toISOString().split('T')[0]}`;
      let mimeType = 'application/json';

      if (selectedFormat === 'json') {
        fileContent = JSON.stringify(data, null, 2);
        fileName += '.json';
        mimeType = 'application/json';
      } else if (selectedFormat === 'csv') {
        const expenses = data.personalExpenses || [];
        const csvData = expenses.map((exp: any) => ({
          Date: new Date(exp.date || exp.createdAt).toLocaleDateString('en-IN'),
          Description: exp.description || '',
          Category: exp.category || '',
          Amount: exp.amount || 0,
          'Payment Method': exp.paymentMethod || '',
          Note: exp.note || '',
        }));

        fileContent = convertToCSV(csvData);
        fileName += '.csv';
        mimeType = 'text/csv';
      } else if (selectedFormat === 'pdf') {
        fileContent = generatePDFContent(data);
        fileName += '.html';
        mimeType = 'text/html';
      }

      // Share the file
      try {
        await Share.share({
          message: `SmartSplit Data Export (${selectedFormat.toUpperCase()})`,
          url: fileContent,
          title: `Export as ${selectedFormat.toUpperCase()}`,
        });

        // Record last export time
        await AsyncStorage.setItem('last_export_time', Date.now().toString());

        setLastExported(
          new Date().toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        );

        showInfoToast('📤 Export ready to download');
        Alert.alert('Success', 'Data export prepared and ready to share!');
      } catch (error: any) {
        if (error.message !== 'Share action dismissed.') {
          Alert.alert('Error', 'Failed to share export file');
          console.error('Share error:', error);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to export data');
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Export My Data</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Animated Icon */}
        <View style={styles.iconSection}>
          <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
            <Text style={styles.icon}>📤</Text>
          </Animated.View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.title}>Export your SmartSplit data</Text>
          <Text style={styles.description}>
            Download a complete backup of your financial data in your preferred format.
          </Text>

          {/* What's Included */}
          <View style={styles.includesBox}>
            <Text style={styles.includesTitle}>Your export will include:</Text>

            <View style={styles.includeItem}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.includeText}>
                {exportDataPreview.personalExpenses} personal expenses
              </Text>
            </View>

            <View style={styles.includeItem}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.includeText}>
                {exportDataPreview.groups} groups with all expenses
              </Text>
            </View>

            <View style={styles.includeItem}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.includeText}>
                All settlements history
              </Text>
            </View>

            <View style={styles.includeItem}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.includeText}>
                Budget settings
              </Text>
            </View>
          </View>

          {/* Format Selection */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>FORMAT:</Text>
            <View style={styles.formatButtons}>
              {(['json', 'csv', 'pdf'] as ExportFormat[]).map((format) => (
                <TouchableOpacity
                  key={format}
                  style={[
                    styles.formatButton,
                    selectedFormat === format && styles.formatButtonActive,
                  ]}
                  onPress={() => setSelectedFormat(format)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.formatEmoji}>
                    {format === 'json' ? '📄' : format === 'csv' ? '📊' : '📑'}
                  </Text>
                  <Text
                    style={[
                      styles.formatText,
                      selectedFormat === format && styles.formatTextActive,
                    ]}
                  >
                    {format.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date Range Selection */}
          <View style={styles.settingGroup}>
            <Text style={styles.settingLabel}>DATE RANGE:</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                Alert.alert('Date Range', 'Select export period', [
                  {
                    text: 'All Time',
                    onPress: () => setSelectedDateRange('all'),
                  },
                  {
                    text: 'Last Month',
                    onPress: () => setSelectedDateRange('last-month'),
                  },
                  {
                    text: 'Last Year',
                    onPress: () => setSelectedDateRange('last-year'),
                  },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.dropdownText}>
                {selectedDateRange === 'all'
                  ? 'All Time'
                  : selectedDateRange === 'last-month'
                    ? 'Last Month'
                    : 'Last Year'}
              </Text>
              <MaterialIcons name="expand-more" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Export Button */}
          <TouchableOpacity
            style={[styles.exportButton, loading && styles.exportButtonDisabled]}
            onPress={handleExport}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color={COLORS.textPrimary} />
                <Text style={styles.exportButtonText}>Preparing your data...</Text>
              </>
            ) : (
              <>
                <MaterialIcons name="file-download" size={20} color={COLORS.textPrimary} />
                <Text style={styles.exportButtonText}>Export & Download</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Last Export Info */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={18} color={COLORS.violet} />
            <Text style={styles.infoText}>
              Last exported: <Text style={styles.infoValue}>{lastExported}</Text>
            </Text>
          </View>

          {/* Privacy Note */}
          <View style={styles.privacyBox}>
            <MaterialIcons name="lock" size={16} color={COLORS.mint} />
            <Text style={styles.privacyText}>
              Your data is encrypted in transit and only you have access to your export files.
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
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
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  iconSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  icon: {
    fontSize: 64,
  },
  contentSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  includesBox: {
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  includesTitle: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  checkmark: {
    fontSize: 16,
    color: COLORS.mint,
    fontWeight: '700',
  },
  includeText: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
  },
  settingGroup: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formatButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  formatButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formatButtonActive: {
    backgroundColor: COLORS.violet,
    borderColor: COLORS.violet,
  },
  formatEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  formatText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textSecondary,
  },
  formatTextActive: {
    color: COLORS.textPrimary,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.elevated,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textPrimary,
  },
  exportButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.violet,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 24,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: `${COLORS.violet}15`,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: `${COLORS.violet}30`,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  infoValue: {
    fontWeight: '600',
    color: COLORS.violet,
  },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: `${COLORS.mint}15`,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: `${COLORS.mint}30`,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  bottomPadding: {
    height: 20,
  },
});
