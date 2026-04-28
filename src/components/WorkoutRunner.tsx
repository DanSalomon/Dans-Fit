import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  StyleSheet,
} from 'react-native';
import {GymWorkout, GymExercise, GymSession} from '../types';
import {EXERCISE_BY_ID} from '../constants/exerciseCatalog';
import {colors} from '../constants/colors';
import {ExerciseImage} from './ExerciseImage';
import {RestTimerOverlay} from './RestTimerOverlay';

interface WorkoutRunnerProps {
  visible: boolean;
  workout: GymWorkout;
  onFinish: (session: GymSession) => void;
  onCancel: () => void;
}

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function formatElapsed(seconds: number): string {
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
}

function setKey(exerciseId: string, setIndex: number): string {
  return `${exerciseId}:${setIndex}`;
}

export function WorkoutRunner({visible, workout, onFinish, onCancel}: WorkoutRunnerProps) {
  const [exercises, setExercises] = useState<GymExercise[]>(workout.exercises);
  const [completedSets, setCompletedSets] = useState<Set<string>>(new Set());
  const [startTime] = useState<number>(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [restVisible, setRestVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(s => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const totalSets = useMemo(
    () => exercises.reduce((sum, e) => sum + e.sets, 0),
    [exercises],
  );

  const toggleSet = (exerciseId: string, setIndex: number) => {
    const key = setKey(exerciseId, setIndex);
    const wasDone = completedSets.has(key);
    setCompletedSets(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
    if (!wasDone) {
      setRestVisible(true);
    }
  };

  const updateExercise = (id: string, patch: Partial<GymExercise>) => {
    setExercises(prev => prev.map(e => (e.id === id ? {...e, ...patch} : e)));
  };

  const buildSession = (): GymSession => {
    const endIso = new Date().toISOString();
    return {
      id: makeId(),
      workoutId: workout.id,
      workoutName: workout.name,
      startTime: new Date(startTime).toISOString(),
      endTime: endIso,
      durationSeconds: Math.floor((Date.now() - startTime) / 1000),
      exercises,
      completedSets: Array.from(completedSets),
    };
  };

  const handleFinish = () => {
    if (completedSets.size === 0) {
      Alert.alert('No sets logged', 'Tap at least one set before finishing, or cancel.');
      return;
    }
    onFinish(buildSession());
  };

  const handleCancel = () => {
    if (completedSets.size > 0) {
      Alert.alert(
        'Discard workout?',
        'You have completed sets that will be lost.',
        [
          {text: 'Keep going', style: 'cancel'},
          {text: 'Discard', style: 'destructive', onPress: onCancel},
        ],
      );
      return;
    }
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleCancel}
      presentationStyle="fullScreen">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.headerBtn}>Cancel</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title} numberOfLines={1}>
              {workout.name}
            </Text>
            <Text style={styles.elapsed}>
              {formatElapsed(elapsed)} · {completedSets.size}/{totalSets} sets
            </Text>
          </View>
          <TouchableOpacity onPress={handleFinish}>
            <Text style={[styles.headerBtn, styles.finishBtn]}>Finish</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          {exercises.map(ex => {
            const entry = EXERCISE_BY_ID[ex.catalogId];
            const isEditing = editingId === ex.id;
            return (
              <View key={ex.id} style={styles.exerciseCard}>
                <View style={styles.exHeader}>
                  {entry ? <ExerciseImage source={entry.image} size={48} /> : null}
                  <View style={styles.exMeta}>
                    <Text style={styles.exName} numberOfLines={2}>
                      {entry?.name ?? 'Unknown exercise'}
                    </Text>
                    <Text style={styles.exTarget}>
                      {ex.sets} × {ex.reps} @ {ex.weight} kg
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setEditingId(isEditing ? null : ex.id)}
                    hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
                    style={styles.editBtn}>
                    <Text style={styles.editHint}>{isEditing ? '✓' : '✎'}</Text>
                  </TouchableOpacity>
                </View>

                {isEditing && (
                  <View style={styles.editorRow}>
                    <EditField
                      label="Reps"
                      value={ex.reps}
                      onChange={v => updateExercise(ex.id, {reps: v})}
                    />
                    <EditField
                      label="Weight (kg)"
                      value={ex.weight}
                      decimals
                      onChange={v => updateExercise(ex.id, {weight: v})}
                    />
                    <EditField
                      label="Sets"
                      value={ex.sets}
                      onChange={v => updateExercise(ex.id, {sets: Math.max(1, v)})}
                    />
                  </View>
                )}

                <View style={styles.chipsRow}>
                  {Array.from({length: ex.sets}).map((_, i) => {
                    const done = completedSets.has(setKey(ex.id, i));
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[styles.chip, done && styles.chipDone]}
                        onPress={() => toggleSet(ex.id, i)}>
                        <Text style={[styles.chipText, done && styles.chipTextDone]}>
                          {done ? '✓' : i + 1}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>

        <RestTimerOverlay
          visible={restVisible}
          onDismiss={() => setRestVisible(false)}
        />
      </View>
    </Modal>
  );
}

interface EditFieldProps {
  label: string;
  value: number;
  decimals?: boolean;
  onChange: (value: number) => void;
}

function EditField({label, value, decimals, onChange}: EditFieldProps) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const handleBlur = () => {
    const parsed = decimals ? parseFloat(text) : parseInt(text, 10);
    if (isNaN(parsed) || parsed < 0) {
      setText(String(value));
      return;
    }
    onChange(parsed);
  };

  return (
    <View style={styles.editField}>
      <Text style={styles.editLabel}>{label}</Text>
      <TextInput
        style={styles.editInput}
        value={text}
        onChangeText={setText}
        onBlur={handleBlur}
        keyboardType={decimals ? 'decimal-pad' : 'number-pad'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: {
    fontSize: 15,
    color: colors.primary,
    minWidth: 60,
  },
  finishBtn: {
    fontWeight: '700',
    color: colors.success,
    textAlign: 'right',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  elapsed: {
    fontSize: 12,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  body: {
    padding: 16,
    paddingBottom: 120,
  },
  exerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  exHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exMeta: {
    flex: 1,
    marginLeft: 12,
  },
  exName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  exTarget: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  editHint: {
    fontSize: 16,
    color: colors.gym,
  },
  editorRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  editField: {
    flex: 1,
  },
  editLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  editInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  chip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipDone: {
    backgroundColor: colors.gym,
    borderColor: colors.gym,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  chipTextDone: {
    color: '#FFFFFF',
  },
});
