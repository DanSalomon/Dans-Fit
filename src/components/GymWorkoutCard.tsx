import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {GymWorkout, GymSession} from '../types';
import {EXERCISE_BY_ID} from '../constants/exerciseCatalog';
import {colors} from '../constants/colors';

interface GymWorkoutCardProps {
  workout: GymWorkout;
  lastSession?: GymSession;
  onStart: () => void;
  onEdit: () => void;
}

function formatLastDone(iso: string): string {
  const then = new Date(iso);
  const now = new Date();
  const ms = now.getTime() - then.getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days === 0) {
    return 'today';
  }
  if (days === 1) {
    return 'yesterday';
  }
  if (days < 7) {
    return `${days} days ago`;
  }
  return then.toLocaleDateString();
}

export function GymWorkoutCard({workout, lastSession, onStart, onEdit}: GymWorkoutCardProps) {
  const previewNames = workout.exercises
    .slice(0, 3)
    .map(e => EXERCISE_BY_ID[e.catalogId]?.name ?? '?')
    .join(' · ');
  const extra = workout.exercises.length - 3;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onStart}
      onLongPress={onEdit}>
      <View style={styles.headerRow}>
        <Text style={styles.name} numberOfLines={1}>
          {workout.name}
        </Text>
        <TouchableOpacity onPress={onEdit} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Text style={styles.editBtn}>Edit</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.count}>
        {workout.exercises.length} exercise{workout.exercises.length === 1 ? '' : 's'}
      </Text>
      {previewNames.length > 0 && (
        <Text style={styles.preview} numberOfLines={1}>
          {previewNames}
          {extra > 0 ? ` +${extra} more` : ''}
        </Text>
      )}
      <View style={styles.footer}>
        <Text style={styles.lastDone}>
          {lastSession ? `Last done ${formatLastDone(lastSession.startTime)}` : 'Not yet started'}
        </Text>
        <View style={styles.startBtn}>
          <Text style={styles.startBtnText}>Start ▶</Text>
        </View>
      </View>
    </TouchableOpacity>
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
    borderLeftWidth: 4,
    borderLeftColor: colors.gym,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginRight: 8,
  },
  editBtn: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  count: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  preview: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastDone: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  startBtn: {
    backgroundColor: colors.gym,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
