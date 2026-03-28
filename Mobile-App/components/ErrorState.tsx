import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ErrorStateProps {
  onRetry: () => void;
  style?: any;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ onRetry, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.emoji}>😕</Text>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.subtitle}>Check your connection and try again</Text>
      <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.85}>
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  emoji: {
    fontSize: 58,
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
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
    marginBottom: 18,
  },
  button: {
    backgroundColor: '#7C5CFC',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
    color: '#F0F0FF',
  },
});
