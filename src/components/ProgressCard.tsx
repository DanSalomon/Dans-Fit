import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {WeeklyProgress} from '../types';
import {ACTIVITY_CONFIGS} from '../constants/exerciseTypes';
import {ProgressBar} from './ProgressBar';
import {colors} from '../constants/colors';

interface ProgressCardProps {
  progress: WeeklyProgress;
}

export function ProgressCard({progress}: ProgressCardProps) {
  const config = ACTIVITY_CONFIGS[progress.category];
  const percentage = progress.target > 0 ? progress.current / progress.target : 0;
  const percentDisplay = Math.round(percentage * 100);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={styles.label}>{config.label}</Text>
      </View>
      <ProgressBar progress={percentage} color={config.color} />
      <View style={styles.footer}>
        <Text style={styles.values}>
          {progress.current} / {progress.target} {progress.unit}
        </Text>
        <Text style={[styles.percent, percentDisplay >= 100 && styles.percentComplete]}>
          {percentDisplay}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  values: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  percent: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  percentComplete: {
    color: colors.success,
  },
});
