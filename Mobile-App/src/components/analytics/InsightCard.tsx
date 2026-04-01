import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { InsightItem } from '@/src/types/analytics.types';

interface InsightCardProps {
  insights: InsightItem[];
}

const typeStyles = {
  warning: {
    backgroundColor: 'rgba(255, 181, 71, 0.14)',
    borderColor: 'rgba(255, 181, 71, 0.45)',
  },
  positive: {
    backgroundColor: 'rgba(0, 229, 176, 0.14)',
    borderColor: 'rgba(0, 229, 176, 0.4)',
  },
  info: {
    backgroundColor: 'rgba(124, 92, 252, 0.14)',
    borderColor: 'rgba(124, 92, 252, 0.45)',
  },
};

export const InsightCard = ({ insights }: InsightCardProps) => {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors.dark; // Force dark theme for consistency
  const { width } = useWindowDimensions();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList<InsightItem>>(null);

  const visibleInsights = useMemo(
    () => insights.filter((item) => !dismissed.has(`${item.type}:${item.message}`)),
    [dismissed, insights]
  );

  useEffect(() => {
    if (visibleInsights.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % visibleInsights.length;
        listRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [visibleInsights.length]);

  useEffect(() => {
    if (currentIndex >= visibleInsights.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, visibleInsights.length]);

  if (!visibleInsights.length) {
    return null;
  }

  return (
    <View>
      <FlatList
        ref={listRef}
        data={visibleInsights}
        horizontal
        pagingEnabled
        keyExtractor={(item) => `${item.type}:${item.message}`}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const palette = typeStyles[item.type] || typeStyles.info;
          const isDark = colorScheme === 'dark';

          return (
            <View style={[styles.card, palette, { width: Math.max(280, width - 42) }]}>
              <View style={styles.cardContent}>
                <Text style={styles.icon}>{item.icon}</Text>
                <View style={styles.textWrap}>
                  <Text style={[styles.message, { color: colors.text }]}>{item.message}</Text>
                  <Text style={[styles.detail, { color: colors.icon }]}>{item.detail}</Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    setDismissed((prev) => {
                      const next = new Set(prev);
                      next.add(`${item.type}:${item.message}`);
                      return next;
                    })
                  }
                  style={styles.dismissButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={14} color={colors.icon} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

export default InsightCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 10,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  icon: {
    fontSize: 18,
    marginTop: 1,
  },
  textWrap: {
    flex: 1,
  },
  message: {
    fontSize: 13,
    fontFamily: 'DMSans_600SemiBold',
  },
  detail: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'DMSans_400Regular',
  },
  dismissButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});
