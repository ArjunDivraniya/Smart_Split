import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MonthSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

const getMonthLabel = (month: number, year: number) => {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

export const MonthSelector = ({ month, year, onChange }: MonthSelectorProps) => {
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const swipeHintX = useRef(new Animated.Value(0)).current;
  const now = new Date();
  const maxDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const minDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const selectedDate = useMemo(() => new Date(year, month - 1, 1), [month, year]);
  const canGoNext = selectedDate < maxDate;
  const canGoPrev = selectedDate > minDate;

  const moveMonth = useCallback((delta: number) => {
    const next = new Date(year, month - 1 + delta, 1);

    if (next > maxDate || next < minDate) {
      return;
    }

    onChange(next.getMonth() + 1, next.getFullYear());
  }, [maxDate, minDate, month, onChange, year]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const absDx = Math.abs(gestureState.dx);
          const absDy = Math.abs(gestureState.dy);
          return absDx > 12 && absDx > absDy;
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx <= -30 && canGoNext) {
            moveMonth(1);
          } else if (gestureState.dx >= 30 && canGoPrev) {
            moveMonth(-1);
          }
        },
      }),
    [canGoNext, canGoPrev, moveMonth]
  );

  useEffect(() => {
    if (!showSwipeHint) {
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(swipeHintX, {
          toValue: 8,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(swipeHintX, {
          toValue: -8,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(swipeHintX, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    const timer = setTimeout(() => {
      setShowSwipeHint(false);
      animation.stop();
    }, 7000);

    return () => {
      clearTimeout(timer);
      animation.stop();
    };
  }, [showSwipeHint, swipeHintX]);

  return (
    <View>
      <View style={styles.container} {...panResponder.panHandlers}>
        <TouchableOpacity
          onPress={() => moveMonth(-1)}
          disabled={!canGoPrev}
          activeOpacity={0.75}
          style={[styles.arrowButton, !canGoPrev && styles.arrowButtonDisabled]}
        >
          <Ionicons name="chevron-back" size={18} color={canGoPrev ? '#F0F0FF' : '#55556A'} />
        </TouchableOpacity>

        <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
          {getMonthLabel(month, year)}
        </Text>

        <TouchableOpacity
          onPress={() => moveMonth(1)}
          disabled={!canGoNext}
          activeOpacity={0.75}
          style={[styles.arrowButton, !canGoNext && styles.arrowButtonDisabled]}
        >
          <Ionicons name="chevron-forward" size={18} color={canGoNext ? '#F0F0FF' : '#55556A'} />
        </TouchableOpacity>
      </View>

      {showSwipeHint ? (
        <Animated.View style={[styles.swipeHintRow, { transform: [{ translateX: swipeHintX }] }]}> 
          <Ionicons name="swap-horizontal" size={13} color="#9B7FFF" />
          <Text style={styles.swipeHintText}>Swipe left or right to change month</Text>
        </Animated.View>
      ) : null}
    </View>
  );
};

export default MonthSelector;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#14141F',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  arrowButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A2B',
    flexShrink: 0,
  },
  arrowButtonDisabled: {
    backgroundColor: '#11111A',
  },
  label: {
    flex: 1,
    marginHorizontal: 10,
    color: '#F0F0FF',
    fontSize: 14,
    fontFamily: 'Syne_700Bold',
    textAlign: 'center',
  },
  swipeHintRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  swipeHintText: {
    color: '#9B7FFF',
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
  },
});
