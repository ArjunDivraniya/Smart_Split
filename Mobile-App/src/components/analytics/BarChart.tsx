import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { MonthlyData } from '@/src/types/analytics.types';

interface BarChartProps {
  monthlyData: MonthlyData[];
  mode?: 'combined' | 'split';
}

const MAX_BAR_HEIGHT = 160;

export const BarChart = ({ monthlyData, mode = 'split' }: BarChartProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const animatedValuesRef = useRef<Animated.Value[]>([]);

  const totals = useMemo(
    () => monthlyData.map((item) => Math.max(0, Number(item.total || item.group + item.personal || 0))),
    [monthlyData]
  );

  const maxTotal = Math.max(...totals, 1);

  useEffect(() => {
    if (animatedValuesRef.current.length !== monthlyData.length) {
      animatedValuesRef.current = monthlyData.map(() => new Animated.Value(0));
    }
  }, [monthlyData]);

  useEffect(() => {
    if (!monthlyData.length || !animatedValuesRef.current.length) {
      return;
    }

    const animations = animatedValuesRef.current.map((value, index) => {
      value.setValue(0);

      return Animated.timing(value, {
        toValue: 1,
        duration: 600,
        delay: index * 80,
        useNativeDriver: false,
      });
    });

    Animated.stagger(80, animations).start();
  }, [monthlyData]);

  useEffect(() => {
    if (selectedIndex !== null && selectedIndex >= monthlyData.length) {
      setSelectedIndex(null);
    }
  }, [monthlyData.length, selectedIndex]);

  if (!monthlyData.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>No monthly trend data available.</Text>
      </View>
    );
  }

  const selected = selectedIndex !== null ? monthlyData[selectedIndex] : null;

  return (
    <View>
      {mode === 'split' ? (
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#7C5CFC' }]} />
            <Text style={styles.legendText}>Group</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#00E5B0' }]} />
            <Text style={styles.legendText}>Personal</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.chartArea}>
        {monthlyData.map((item, index) => {
          const total = Math.max(0, Number(item.total || item.group + item.personal || 0));
          const normalizedHeight = (total / maxTotal) * MAX_BAR_HEIGHT;
          const animatedValue = animatedValuesRef.current[index] || new Animated.Value(1);
          const totalHeight = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, normalizedHeight],
          });

          const groupRatio = total > 0 ? item.group / total : 0;
          const personalRatio = total > 0 ? item.personal / total : 0;

          return (
            <Pressable
              key={`${item.label}-${index}`}
              style={styles.barColumn}
              onPress={() => setSelectedIndex(index)}
            >
              <View style={styles.barBackground}>
                {mode === 'combined' ? (
                  <Animated.View
                    style={[
                      styles.combinedBar,
                      {
                        height: totalHeight,
                        backgroundColor: '#7C5CFC',
                        opacity: selectedIndex === index ? 1 : 0.88,
                      },
                    ]}
                  />
                ) : (
                  <Animated.View
                    style={[
                      styles.splitStack,
                      {
                        height: totalHeight,
                        opacity: selectedIndex === index ? 1 : 0.92,
                      },
                    ]}
                  >
                    <View style={[styles.segment, { flex: personalRatio, backgroundColor: '#00E5B0' }]} />
                    <View style={[styles.segment, { flex: groupRatio, backgroundColor: '#7C5CFC' }]} />
                  </Animated.View>
                )}
              </View>
              <Text style={styles.monthLabel}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {selected ? (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipTitle}>{selected.label}</Text>
          <Text style={styles.tooltipText}>Total: ₹{Math.round(selected.total).toLocaleString('en-IN')}</Text>
          <Text style={styles.tooltipText}>Group: ₹{Math.round(selected.group).toLocaleString('en-IN')}</Text>
          <Text style={styles.tooltipText}>Personal: ₹{Math.round(selected.personal).toLocaleString('en-IN')}</Text>
        </View>
      ) : null}
    </View>
  );
};

export default BarChart;

const styles = StyleSheet.create({
  legendRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: '#A0A0BF',
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
  },
  chartArea: {
    minHeight: 220,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#14141F',
    paddingHorizontal: 10,
    paddingTop: 18,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  barBackground: {
    width: 22,
    height: MAX_BAR_HEIGHT,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  combinedBar: {
    width: '100%',
    borderRadius: 8,
  },
  splitStack: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segment: {
    width: '100%',
  },
  monthLabel: {
    color: '#8888AA',
    fontSize: 10,
    fontFamily: 'DMSans_500Medium',
  },
  tooltip: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#1A1A2B',
    padding: 12,
  },
  tooltipTitle: {
    color: '#F0F0FF',
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
    marginBottom: 4,
  },
  tooltipText: {
    color: '#8888AA',
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
    lineHeight: 18,
  },
  emptyWrap: {
    minHeight: 220,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#14141F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#8888AA',
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
  },
});
