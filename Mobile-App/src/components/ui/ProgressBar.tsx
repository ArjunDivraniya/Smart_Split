import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ProgressBarProps {
  percentage: number;
  color: string;
}

export function ProgressBar({ percentage, color }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Number(percentage || 0)));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});

export default ProgressBar;
