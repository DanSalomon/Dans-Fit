import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors} from '../constants/colors';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color: string;
}

export function ProgressBar({progress, color}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 12,
    backgroundColor: colors.progressBackground,
    borderRadius: 6,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
  },
});
