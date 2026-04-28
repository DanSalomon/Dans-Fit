import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {GymWorkout, GymExercise, ExerciseCatalogEntry} from '../types';
import {EXERCISE_BY_ID} from '../constants/exerciseCatalog';
import {colors} from '../constants/colors';
import {ExerciseImage} from './ExerciseImage';
import {ExercisePicker} from './ExercisePicker';

interface WorkoutBuilderProps {
  visible: boolean;
  existingWorkout?: GymWorkout;
  onSave: (workout: GymWorkout) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function WorkoutBuilder({
  visible,
  existingWorkout,
  onSave,
  onCancel,
  onDelete,
}: WorkoutBuilderProps) {
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<GymExercise[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(existingWorkout?.name ?? '');
      setExercises(existingWorkout?.exercises ?? []);
    }
  }, [visible, existingWorkout]);

  const handleAddExercise = (entry: ExerciseCatalogEntry) => {
    setExercises(prev => [
      ...prev,
      {id: makeId(), catalogId: entry.id, sets: 3, reps: 10, weight: 0},
    ]);
    setPickerVisible(false);
  };

  const updateExercise = (id: string, patch: Partial<GymExercise>) => {
    setExercises(prev => prev.map(e => (e.id === id ? {...e, ...patch} : e)));
  };

  const removeExercise = (id: string) => {
    setExercises(prev => prev.filter(e => e.id !== id));
  };

  const moveExercise = (id: string, direction: 'up' | 'down') => {
    setExercises(prev => {
      const idx = prev.findIndex(e => e.id === id);
      if (idx < 0) {
        return prev;
      }
      const target = direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= prev.length) {
        return prev;
      }
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed || exercises.length === 0) {
      return;
    }
    const workout: GymWorkout = {
      id: existingWorkout?.id ?? makeId(),
      name: trimmed,
      exercises,
      updatedAt: new Date().toISOString(),
    };
    onSave(workout);
  };

  const canSave = name.trim().length > 0 && exercises.length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onCancel}
      presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.headerBtn}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {existingWorkout ? 'Edit Workout' : 'New Workout'}
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={!canSave}>
            <Text style={[styles.headerBtn, styles.save, !canSave && styles.disabled]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.sectionLabel}>Name</Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Push Day"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.sectionLabel}>Exercises</Text>
          {exercises.length === 0 && (
            <Text style={styles.emptyHint}>
              Tap "Add exercise" to pick from the catalog.
            </Text>
          )}
          {exercises.map((ex, idx) => {
            const entry = EXERCISE_BY_ID[ex.catalogId];
            const isFirst = idx === 0;
            const isLast = idx === exercises.length - 1;
            return (
              <View key={ex.id} style={styles.exerciseRow}>
                <View style={styles.exerciseHeader}>
                  {entry ? <ExerciseImage source={entry.image} size={44} /> : null}
                  <Text style={styles.exerciseName} numberOfLines={2}>
                    {entry?.name ?? 'Unknown exercise'}
                  </Text>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      onPress={() => moveExercise(ex.id, 'up')}
                      disabled={isFirst}
                      hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
                      style={[styles.iconBtn, isFirst && styles.iconBtnDisabled]}>
                      <Text style={styles.iconBtnText}>▲</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => moveExercise(ex.id, 'down')}
                      disabled={isLast}
                      hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
                      style={[styles.iconBtn, isLast && styles.iconBtnDisabled]}>
                      <Text style={styles.iconBtnText}>▼</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeExercise(ex.id)}
                      hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
                      style={styles.iconBtn}>
                      <Text style={styles.removeBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.fieldsRow}>
                  <NumberField
                    label="Sets"
                    value={ex.sets}
                    onChange={v => updateExercise(ex.id, {sets: v})}
                  />
                  <NumberField
                    label="Reps"
                    value={ex.reps}
                    onChange={v => updateExercise(ex.id, {reps: v})}
                  />
                  <NumberField
                    label="kg"
                    value={ex.weight}
                    decimals
                    onChange={v => updateExercise(ex.id, {weight: v})}
                  />
                </View>
              </View>
            );
          })}

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setPickerVisible(true)}>
            <Text style={styles.addBtnText}>+ Add exercise</Text>
          </TouchableOpacity>

          {existingWorkout && onDelete && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => onDelete(existingWorkout.id)}>
              <Text style={styles.deleteBtnText}>Delete Workout</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <ExercisePicker
          visible={pickerVisible}
          onSelect={handleAddExercise}
          onCancel={() => setPickerVisible(false)}
        />
      </View>
    </Modal>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  decimals?: boolean;
  onChange: (value: number) => void;
}

function NumberField({label, value, decimals, onChange}: NumberFieldProps) {
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
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  headerBtn: {
    fontSize: 15,
    color: colors.primary,
    minWidth: 56,
  },
  save: {
    fontWeight: '700',
    textAlign: 'right',
  },
  disabled: {
    opacity: 0.4,
  },
  body: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  emptyHint: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  exerciseRow: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBtnDisabled: {
    opacity: 0.3,
  },
  iconBtnText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '700',
  },
  removeBtn: {
    fontSize: 14,
    color: colors.danger,
    fontWeight: '700',
  },
  fieldsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  field: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  fieldInput: {
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
  addBtn: {
    backgroundColor: colors.gym + '15',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.gym,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addBtnText: {
    color: colors.gym,
    fontSize: 15,
    fontWeight: '600',
  },
  deleteBtn: {
    marginTop: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '500',
  },
});
