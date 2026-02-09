import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors} from '../constants/colors';

interface EmptyStateProps {
  onGoToSettings: () => void;
}

export function EmptyState({onGoToSettings}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>No goals set yet</Text>
      <Text style={styles.subtitle}>
        Go to Settings to add your{'\n'}weekly fitness goals
      </Text>
      <TouchableOpacity style={styles.button} onPress={onGoToSettings}>
        <Text style={styles.buttonText}>Go to Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
