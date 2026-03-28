import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: any;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  emoji,
  title,
  subtitle,
  actionLabel,
  onAction,
  style,
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -12,
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

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.emojiContainer,
          {
            transform: [{ translateY: floatAnim }],
          },
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
      </Animated.View>

      <Text style={styles.title}>{title}</Text>

      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emojiContainer: {
    marginBottom: 16,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Syne_700Bold',
    color: '#F0F0FF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    color: '#A0A0BF',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#7C5CFC',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
    color: '#F0F0FF',
  },
});
