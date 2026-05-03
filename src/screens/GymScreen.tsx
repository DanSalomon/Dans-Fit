import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {GymWorkout, GymSession} from '../types';
import {GymWorkoutCard} from '../components/GymWorkoutCard';
import {WorkoutBuilder} from '../components/WorkoutBuilder';
import {WorkoutRunner} from '../components/WorkoutRunner';
import {clearHistoryCache} from '../storage/historyCacheStorage';
import {writeStrengthSession} from '../services/healthConnect';
import {EXERCISE_BY_ID} from '../constants/exerciseCatalog';
import {colors} from '../constants/colors';

interface GymScreenProps {
  workouts: GymWorkout[];
  sessions: GymSession[];
  onAddWorkout: (workout: GymWorkout) => Promise<void> | void;
  onUpdateWorkout: (workout: GymWorkout) => Promise<void> | void;
  onRemoveWorkout: (id: string) => Promise<void> | void;
  onAppendSession: (session: GymSession) => Promise<void> | void;
}

export function GymScreen({
  workouts,
  sessions,
  onAddWorkout,
  onUpdateWorkout,
  onRemoveWorkout,
  onAppendSession,
}: GymScreenProps) {
  const [builderWorkout, setBuilderWorkout] = useState<GymWorkout | undefined>(undefined);
  const [builderVisible, setBuilderVisible] = useState(false);
  const [runningWorkout, setRunningWorkout] = useState<GymWorkout | null>(null);

  const lastSessionByWorkout = useMemo(() => {
    const map: Record<string, GymSession> = {};
    for (const s of sessions) {
      const existing = map[s.workoutId];
      if (!existing || s.startTime > existing.startTime) {
        map[s.workoutId] = s;
      }
    }
    return map;
  }, [sessions]);

  const openNewBuilder = () => {
    setBuilderWorkout(undefined);
    setBuilderVisible(true);
  };

  const openEditBuilder = (workout: GymWorkout) => {
    setBuilderWorkout(workout);
    setBuilderVisible(true);
  };

  const handleSaveFromBuilder = async (workout: GymWorkout) => {
    if (builderWorkout) {
      await onUpdateWorkout(workout);
    } else {
      await onAddWorkout(workout);
    }
    setBuilderVisible(false);
  };

  const handleDeleteFromBuilder = async (id: string) => {
    await onRemoveWorkout(id);
    setBuilderVisible(false);
  };

  const handleStartWorkout = (workout: GymWorkout) => {
    setRunningWorkout(workout);
  };

  const handleFinishRun = async (session: GymSession) => {
    await onAppendSession(session);
    if (runningWorkout) {
      await onUpdateWorkout({
        ...runningWorkout,
        exercises: session.exercises,
        updatedAt: new Date().toISOString(),
      });
    }

    // Mirror the session into Health Connect so it counts toward the gym goal.
    const notes = session.exercises
      .map(ex => {
        const name = EXERCISE_BY_ID[ex.catalogId]?.name ?? 'Exercise';
        return `${name}: ${ex.sets}x${ex.reps} @ ${ex.weight}kg`;
      })
      .join('\n');
    writeStrengthSession({
      startTime: session.startTime,
      endTime: session.endTime,
      title: session.workoutName,
      notes,
    }).catch(() => {});

    await clearHistoryCache();
    setRunningWorkout(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {workouts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={styles.emptyTitle}>No Workouts Yet</Text>
            <Text style={styles.emptySubtitle}>
              Define a workout to start logging sets and reps.
            </Text>
          </View>
        ) : (
          workouts.map(w => (
            <GymWorkoutCard
              key={w.id}
              workout={w}
              lastSession={lastSessionByWorkout[w.id]}
              onStart={() => handleStartWorkout(w)}
              onEdit={() => openEditBuilder(w)}
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={openNewBuilder}>
        <Text style={styles.fabText}>+ New Workout</Text>
      </TouchableOpacity>

      <WorkoutBuilder
        visible={builderVisible}
        existingWorkout={builderWorkout}
        onSave={handleSaveFromBuilder}
        onCancel={() => setBuilderVisible(false)}
        onDelete={builderWorkout ? handleDeleteFromBuilder : undefined}
      />

      {runningWorkout && (
        <WorkoutRunner
          visible={!!runningWorkout}
          workout={runningWorkout}
          onFinish={handleFinishRun}
          onCancel={() => setRunningWorkout(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.gym,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
