import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {GymSession} from '../types';
import {EXERCISE_BY_ID} from '../constants/exerciseCatalog';
import {ExerciseImage} from './ExerciseImage';
import {colors} from '../constants/colors';

interface GymSessionDetailProps {
  session: GymSession;
}

function formatDuration(seconds: number): string {
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  if (mm === 0) {
    return `${ss}s`;
  }
  return `${mm}m ${ss.toString().padStart(2, '0')}s`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function countCompletedSetsForExercise(session: GymSession, exerciseId: string): number {
  return session.completedSets.filter(k => k.startsWith(`${exerciseId}:`)).length;
}

export function GymSessionDetail({session}: GymSessionDetailProps) {
  const [expanded, setExpanded] = useState(false);
  const totalSets = session.exercises.reduce((s, e) => s + e.sets, 0);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)}>
        <View style={styles.headerText}>
          <Text style={styles.name}>{session.workoutName}</Text>
          <Text style={styles.meta}>
            {formatTime(session.startTime)} · {formatDuration(session.durationSeconds)} ·{' '}
            {session.completedSets.length}/{totalSets} sets
          </Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.exercises}>
          {session.exercises.map(ex => {
            const entry = EXERCISE_BY_ID[ex.catalogId];
            const done = countCompletedSetsForExercise(session, ex.id);
            return (
              <View key={ex.id} style={styles.exRow}>
                {entry ? <ExerciseImage source={entry.image} size={36} /> : null}
                <View style={styles.exMeta}>
                  <Text style={styles.exName}>{entry?.name ?? '—'}</Text>
                  <Text style={styles.exDetail}>
                    {done}/{ex.sets} × {ex.reps} @ {ex.weight} kg
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.gym,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 10,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  exercises: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  exMeta: {
    marginLeft: 10,
    flex: 1,
  },
  exName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  exDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
});
