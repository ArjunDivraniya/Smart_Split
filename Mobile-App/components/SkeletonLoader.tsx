import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  void: '#080810',
  surface: '#0F0F1A',
  card: '#14141F',
  elevated: '#1A1A2B',
  border: 'rgba(255, 255, 255, 0.08)',
};

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  style?: any;
  animated?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
  animated = true,
}) => {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [shimmerAnim, animated]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: shimmerOpacity,
        },
        style,
      ]}
    />
  );
};

interface SkeletonCardProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  style?: any;
}

// Balance Card Skeleton
export const BalanceCardSkeleton: React.FC<SkeletonCardProps> = ({
  width = '100%',
  height = 100,
  borderRadius = 12,
  style,
}) => {
  return (
    <View style={[styles.skeletonCard, { borderRadius }, style]}>
      <SkeletonLoader width="40%" height={14} borderRadius={6} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="60%" height={22} borderRadius={6} />
    </View>
  );
};

// Group Card Skeleton
export const GroupCardSkeleton: React.FC<SkeletonCardProps> = ({
  width = '100%',
  height = 100,
  borderRadius = 12,
  style,
}) => {
  return (
    <View style={[styles.skeletonCard, { borderRadius }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <SkeletonLoader width={48} height={48} borderRadius={24} />
        <View style={{ flex: 1 }}>
          <SkeletonLoader width="80%" height={14} borderRadius={6} style={{ marginBottom: 6 }} />
          <SkeletonLoader width="50%" height={12} borderRadius={6} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <SkeletonLoader width="45%" height={12} borderRadius={6} />
        <SkeletonLoader width="35%" height={12} borderRadius={6} />
      </View>
    </View>
  );
};

// Expense Item Skeleton
export const ExpenseItemSkeleton: React.FC<SkeletonCardProps> = ({
  width = '100%',
  height = 80,
  borderRadius = 10,
  style,
}) => {
  return (
    <View style={[styles.skeletonCard, { borderRadius }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <SkeletonLoader width={40} height={40} borderRadius={8} />
        <View style={{ flex: 1 }}>
          <SkeletonLoader width="70%" height={13} borderRadius={6} style={{ marginBottom: 4 }} />
          <SkeletonLoader width="40%" height={11} borderRadius={6} />
        </View>
        <SkeletonLoader width={50} height={16} borderRadius={6} />
      </View>
      <SkeletonLoader width="55%" height={11} borderRadius={6} />
    </View>
  );
};

// Friend Card Skeleton
export const FriendCardSkeleton: React.FC<SkeletonCardProps> = ({
  width = '100%',
  height = 70,
  borderRadius = 12,
  style,
}) => {
  return (
    <View style={[styles.skeletonCard, { borderRadius }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <SkeletonLoader width={48} height={48} borderRadius={24} />
          <View style={{ flex: 1 }}>
            <SkeletonLoader width="70%" height={14} borderRadius={6} style={{ marginBottom: 6 }} />
            <SkeletonLoader width="45%" height={12} borderRadius={6} />
          </View>
        </View>
        <SkeletonLoader width={50} height={32} borderRadius={8} />
      </View>
    </View>
  );
};

// Chart Placeholder Skeleton
export const ChartSkeletonLoader: React.FC<SkeletonCardProps> = ({
  width = '100%',
  height = 200,
  borderRadius = 12,
  style,
}) => {
  return (
    <View style={[styles.skeletonCard, { borderRadius, padding: 16 }, style]}>
      <SkeletonLoader width="50%" height={14} borderRadius={6} style={{ marginBottom: 16 }} />
      <View style={{ height: typeof height === 'number' ? height : 200 }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              flex: 1,
              marginBottom: 8,
            }}
          >
            <SkeletonLoader
              width={30}
              height={Math.random() * 80 + 30}
              borderRadius={6}
            />
            <SkeletonLoader
              width={30}
              height={Math.random() * 80 + 30}
              borderRadius={6}
            />
            <SkeletonLoader
              width={30}
              height={Math.random() * 80 + 30}
              borderRadius={6}
            />
            <SkeletonLoader
              width={30}
              height={Math.random() * 80 + 30}
              borderRadius={6}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

// Notification Skeleton
export const NotificationSkeletonLoader: React.FC<SkeletonCardProps> = ({
  width = '100%',
  height = 70,
  borderRadius = 10,
  style,
}) => {
  return (
    <View style={[styles.skeletonCard, { borderRadius }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <SkeletonLoader width={40} height={40} borderRadius={8} />
        <View style={{ flex: 1 }}>
          <SkeletonLoader width="75%" height={13} borderRadius={6} style={{ marginBottom: 6 }} />
          <SkeletonLoader width="50%" height={11} borderRadius={6} />
        </View>
      </View>
    </View>
  );
};

// Stats Row Skeleton
export const StatsRowSkeletonLoader: React.FC<SkeletonCardProps> = ({
  width = '100%',
  style,
}) => {
  return (
    <View style={[{ width }, style]}>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ flex: 1 }}>
            <SkeletonLoader
              width="100%"
              height={60}
              borderRadius={10}
              style={{ marginBottom: 8 }}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skeletonCard: {
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
});
