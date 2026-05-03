import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import notifee, {
  AndroidImportance,
  TriggerType,
  TimestampTrigger,
} from '@notifee/react-native';
import {colors} from '../constants/colors';

const REST_SECONDS = 60;
const CHANNEL_ID = 'rest-timer';

interface RestTimerOverlayProps {
  visible: boolean;
  onDismiss: () => void;
}

function formatSeconds(s: number): string {
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

async function ensureChannel(): Promise<string> {
  return notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Rest Timer',
    importance: AndroidImportance.HIGH,
    vibration: true,
    vibrationPattern: [400, 150, 400],
    sound: 'default',
  });
}

export function RestTimerOverlay({visible, onDismiss}: RestTimerOverlayProps) {
  const [secondsLeft, setSecondsLeft] = useState(REST_SECONDS);
  const onDismissRef = useRef(onDismiss);
  const notificationIdRef = useRef<string | null>(null);
  const startMsRef = useRef<number>(0);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  // Schedule the native notification once when the overlay becomes visible.
  useEffect(() => {
    if (!visible) {
      return;
    }
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startMs = Date.now();
    startMsRef.current = startMs;
    const fireMs = startMs + REST_SECONDS * 1000;

    setSecondsLeft(REST_SECONDS);

    (async () => {
      try {
        await notifee.requestPermission();
        const channelId = await ensureChannel();
        const trigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: fireMs,
          alarmManager: {allowWhileIdle: true},
        };
        const id = await notifee.createTriggerNotification(
          {
            title: 'Rest complete',
            body: 'Time for the next set',
            android: {
              channelId,
              smallIcon: 'ic_launcher',
              vibrationPattern: [400, 150, 400],
              pressAction: {id: 'default'},
              autoCancel: true,
            },
          },
          trigger,
        );
        if (cancelled) {
          await notifee.cancelTriggerNotification(id);
        } else {
          notificationIdRef.current = id;
        }
      } catch (e) {
        // If notifications are denied we still tick down visually; on dismissal
        // we just won't have a buzz cue if backgrounded.
      }
    })();

    intervalId = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((fireMs - Date.now()) / 1000),
      );
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        onDismissRef.current();
      }
    }, 250);

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
      const id = notificationIdRef.current;
      notificationIdRef.current = null;
      if (id) {
        // Cancel the scheduled trigger if the user skipped early or component
        // unmounted before the timer fired.
        const remaining = fireMs - Date.now();
        if (remaining > 0) {
          notifee.cancelTriggerNotification(id).catch(() => {});
        }
      }
    };
  }, [visible]);

  const handleSkip = () => {
    onDismissRef.current();
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.banner}>
        <Text style={styles.label}>Rest</Text>
        <Text style={styles.countdown}>{formatSeconds(secondsLeft)}</Text>
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
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
