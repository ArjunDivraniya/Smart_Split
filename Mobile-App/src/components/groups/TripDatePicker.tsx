// Mobile-App/src/components/groups/TripDatePicker.tsx

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

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

interface TripDatePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

export function TripDatePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: TripDatePickerProps) {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
    }
    if (selectedDate) {
      onStartDateChange(selectedDate);
      // If start date is after end date, update end date
      if (endDate && selectedDate > endDate) {
        onEndDateChange(new Date(selectedDate.getTime() + 86400000)); // +1 day
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndPicker(false);
    }
    if (selectedDate) {
      // Ensure end date is not before start date
      if (startDate && selectedDate < startDate) {
        onEndDateChange(startDate);
      } else {
        onEndDateChange(selectedDate);
      }
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Select date';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDuration = (): string => {
    if (!startDate || !endDate) return '';
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Trip Duration</Text>

      <View style={styles.dateRow}>
        <View style={styles.dateInput}>
          <View style={styles.dateInputHeader}>
            <Ionicons name="calendar" size={16} color={COLORS.violet} />
            <Text style={styles.dateInputLabel}>Start Date</Text>
          </View>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.arrow}>
          <Ionicons name="arrow-forward" size={20} color={COLORS.violet} />
        </View>

        <View style={styles.dateInput}>
          <View style={styles.dateInputHeader}>
            <Ionicons name="calendar" size={16} color={COLORS.mint} />
            <Text style={styles.dateInputLabel}>End Date</Text>
          </View>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {startDate && endDate && (
        <View style={styles.durationBox}>
          <Ionicons name="time" size={16} color={COLORS.amber} />
          <Text style={styles.durationText}>{getDuration()}</Text>
        </View>
      )}

      {/* Start Date Picker */}
      {showStartPicker && (
        <>
          {Platform.OS === 'ios' ? (
            <Modal transparent animationType="slide" visible={showStartPicker}>
              <View style={styles.pickerModal}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Select Start Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowStartPicker(false)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={COLORS.textPrimary}
                    />
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={startDate || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={handleStartDateChange}
                  minimumDate={new Date()}
                  maximumDate={
                    endDate ||
                    new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000)
                  }
                  textColor={COLORS.textPrimary}
                />
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowStartPicker(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pickerButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="default"
              onChange={handleStartDateChange}
              minimumDate={new Date()}
            />
          )}
        </>
      )}

      {/* End Date Picker */}
      {showEndPicker && (
        <>
          {Platform.OS === 'ios' ? (
            <Modal transparent animationType="slide" visible={showEndPicker}>
              <View style={styles.pickerModal}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Select End Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowEndPicker(false)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={COLORS.textPrimary}
                    />
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={endDate || (startDate ? new Date(startDate.getTime() + 86400000) : new Date())}
                  mode="date"
                  display="spinner"
                  onChange={handleEndDateChange}
                  minimumDate={
                    startDate || new Date()
                  }
                  maximumDate={
                    new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000)
                  }
                  textColor={COLORS.textPrimary}
                />
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowEndPicker(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pickerButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={endDate || (startDate ? new Date(startDate.getTime() + 86400000) : new Date())}
              mode="date"
              display="default"
              onChange={handleEndDateChange}
              minimumDate={startDate || new Date()}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  dateInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dateInputLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'DMSans_400Regular',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.elevated,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateButtonText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.textPrimary,
  },
  arrow: {
    paddingBottom: 24,
  },
  durationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: `${COLORS.amber}15`,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: `${COLORS.amber}30`,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Syne_700Bold',
    color: COLORS.amber,
  },
  pickerModal: {
    flex: 1,
    backgroundColor: COLORS.surface,
    justifyContent: 'flex-end',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
  pickerButton: {
    backgroundColor: COLORS.violet,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: COLORS.textPrimary,
  },
});
