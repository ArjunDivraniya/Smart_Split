import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

type ActiveView = 'combined' | 'bygroup';
type ActiveDirection = 'all' | 'you_owe' | 'they_owe';

interface ViewToggleProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  activeDirection: ActiveDirection;
  onDirectionChange: (direction: ActiveDirection) => void;
}

const COLORS = {
  elevated: '#1A1A2B',
  border: 'rgba(255, 255, 255, 0.10)',
  textPrimary: '#F3F3FF',
  textMuted: '#9A9AB6',
  violet: '#7C5CFC',
  sheet: 'rgba(8, 8, 16, 0.78)',
  optionBg: '#121222',
};

const DIRECTION_LABELS: Record<ActiveDirection, string> = {
  all: 'All',
  you_owe: 'You Owe',
  they_owe: 'You Get',
};

export function ViewToggle({
  activeView,
  onViewChange,
  activeDirection,
  onDirectionChange,
}: ViewToggleProps) {
  const [showDirectionModal, setShowDirectionModal] = useState(false);

  const handleDirectionSelect = (direction: ActiveDirection) => {
    onDirectionChange(direction);
    setShowDirectionModal(false);
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.directionControl}
        onPress={() => setShowDirectionModal(true)}
        activeOpacity={0.9}
      >
        <Text style={styles.directionText}>{DIRECTION_LABELS[activeDirection]} ▾</Text>
      </TouchableOpacity>

      <View style={styles.segmentedWrap}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeView === 'combined' ? styles.segmentActive : styles.segmentInactive]}
          onPress={() => onViewChange('combined')}
          activeOpacity={0.9}
        >
          <Text style={[styles.segmentText, activeView === 'combined' ? styles.segmentTextActive : null]}>
            ≡ Combined
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeView === 'bygroup' ? styles.segmentActive : styles.segmentInactive]}
          onPress={() => onViewChange('bygroup')}
          activeOpacity={0.9}
        >
          <Text style={[styles.segmentText, activeView === 'bygroup' ? styles.segmentTextActive : null]}>
            ⊞ By Group
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showDirectionModal}
        transparent
        animationType='fade'
        onRequestClose={() => setShowDirectionModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDirectionModal(false)}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Direction</Text>

              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => handleDirectionSelect('all')}
                activeOpacity={0.9}
              >
                <Text style={styles.optionText}>All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => handleDirectionSelect('you_owe')}
                activeOpacity={0.9}
              >
                <Text style={styles.optionText}>You Owe</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionRow}
                onPress={() => handleDirectionSelect('they_owe')}
                activeOpacity={0.9}
              >
                <Text style={styles.optionText}>You Get</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>
    </View>
  );
}

export default ViewToggle;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  directionControl: {
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    minWidth: 92,
  },
  directionText: {
    color: COLORS.textPrimary,
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
  },
  segmentedWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.elevated,
    padding: 3,
    flexShrink: 1,
  },
  segmentBtn: {
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 92,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: COLORS.violet,
  },
  segmentInactive: {
    backgroundColor: 'transparent',
  },
  segmentText: {
    color: COLORS.textMuted,
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.sheet,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: COLORS.optionBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    marginBottom: 10,
  },
  optionRow: {
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  optionText: {
    color: COLORS.textPrimary,
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
  },
});
