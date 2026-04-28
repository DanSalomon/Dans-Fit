import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, Vibration, StyleSheet} from 'react-native';
import {colors} from '../constants/colors';

const REST_SECONDS = 60;

interface RestTimerOverlayProps {
  visible: boolean;
  onDismiss: () => void;
}

function formatSeconds(s: number): string {
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

export function RestTimerOverlay({visible, onDismiss}: RestTimerOverlayProps) {
  const [secondsLeft, setSecondsLeft] = useState(REST_SECONDS);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setSecondsLeft(REST_SECONDS);
    const id = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          Vibration.vibrate([0, 400, 150, 400]);
          onDismissRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.banner}>
        <Text style={styles.label}>Rest</Text>
        <Text style={styles.countdown}>{formatSeconds(secondsLeft)}</Text>
        <TouchableOpacity style={styles.skipBtn} onPress={onDismiss}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gym,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginRight: 14,
  },
  countdown: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  skipBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
