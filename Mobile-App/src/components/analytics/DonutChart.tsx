import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { CategoryData } from '@/src/types/analytics.types';

interface DonutChartProps {
  categories: CategoryData[];
  totalAmount: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Drinks': '#7C5CFC',
  Transport: '#00E5B0',
  Entertainment: '#FF5F7E',
  Shopping: '#FFB547',
  Health: '#38BDF8',
  Education: '#9B7FFF',
  Rent: '#FF8C42',
  Subscriptions: '#00C4FF',
  Gaming: '#A3E635',
  Travel: '#14B8A6',
  Gifts: '#F97316',
  Other: '#64748B',
};

const CUSTOM_CATEGORY_PALETTE = [
  '#22D3EE',
  '#F43F5E',
  '#34D399',
  '#F59E0B',
  '#A78BFA',
  '#2DD4BF',
  '#E879F9',
  '#60A5FA',
  '#84CC16',
  '#FB7185',
  '#06B6D4',
  '#F472B6',
];

const getCategoryColorMap = (categories: CategoryData[]): Record<string, string> => {
  const colorMap: Record<string, string> = { ...CATEGORY_COLORS };
  let customColorIndex = 0;

  categories.forEach((item) => {
    const key = item.category?.trim();
    if (!key || colorMap[key]) {
      return;
    }

    colorMap[key] = CUSTOM_CATEGORY_PALETTE[customColorIndex % CUSTOM_CATEGORY_PALETTE.length];
    customColorIndex += 1;
  });

  return colorMap;
};

export const DonutChart = ({ categories, totalAmount }: DonutChartProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const categoryColorMap = useMemo(() => getCategoryColorMap(categories), [categories]);

  const pieData = useMemo(
    () =>
      categories.map((item) => ({
        value: Number(item.total || 0),
        color: categoryColorMap[item.category] || '#55556A',
      })),
    [categories, categoryColorMap]
  );

  const selected = categories[selectedIndex] || categories[0];

  if (!categories.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>No category data for this month yet.</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.chartWrap}>
        <View style={styles.pieArea}>
          <PieChart
            data={pieData}
            donut
            radius={118}
            innerRadius={72}
            focusOnPress
            onPress={(_item: unknown, index: number) => setSelectedIndex(index)}
            sectionAutoFocus
            innerCircleColor="#14141F"
            isAnimated
            animationDuration={800}
            initialAngle={-90}
            centerLabelComponent={() => (
              <View style={styles.centerLabel}>
                <Text style={styles.totalAmount}>₹{Math.round(totalAmount).toLocaleString('en-IN')}</Text>
                <Text style={styles.totalLabel}>This Month</Text>
              </View>
            )}
          />
        </View>

        <View style={styles.inChartLegendWrap}>
          {categories.map((item) => (
            <View key={item.category} style={styles.inChartLegendItem}>
              <View style={[styles.dot, { backgroundColor: categoryColorMap[item.category] || '#55556A' }]} />
              <Text style={styles.inChartLegendText} numberOfLines={1}>
                {item.category}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {selected ? (
        <View style={styles.detailCard}>
          <View style={[styles.dot, { backgroundColor: categoryColorMap[selected.category] || '#55556A' }]} />
          <View style={styles.detailContent}>
            <Text style={styles.detailCategory}>{selected.category}</Text>
            <Text style={styles.detailMeta}>
              ₹{Math.round(selected.total).toLocaleString('en-IN')} · {selected.percentage}% · {selected.count} txns
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default DonutChart;

const styles = StyleSheet.create({
  chartWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#14141F',
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 12,
  },
  pieArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    alignItems: 'center',
  },
  totalAmount: {
    color: '#F0F0FF',
    fontSize: 18,
    fontFamily: 'Syne_700Bold',
  },
  totalLabel: {
    marginTop: 2,
    color: '#8888AA',
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
  detailCard: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#1A1A2B',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  detailContent: {
    flex: 1,
  },
  detailCategory: {
    color: '#F0F0FF',
    fontSize: 14,
    fontFamily: 'DMSans_600SemiBold',
  },
  detailMeta: {
    marginTop: 2,
    color: '#8888AA',
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
  },
  inChartLegendWrap: {
    marginTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  inChartLegendItem: {
    maxWidth: '48%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#1A1A2B',
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inChartLegendText: {
    color: '#D1D1E8',
    fontSize: 10,
    fontFamily: 'DMSans_500Medium',
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
