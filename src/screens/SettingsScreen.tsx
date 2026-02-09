import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {ActivityCategory, Goal} from '../types';
import {ACTIVITY_CONFIGS} from '../constants/exerciseTypes';
import {GoalEditor} from '../components/GoalEditor';
import {colors} from '../constants/colors';

interface SettingsScreenProps {
  goals: Goal[];
  onAddGoal: (category: ActivityCategory, target: number) => void;
  onEditGoal: (id: string, target: number) => void;
  onRemoveGoal: (id: string) => void;
}

export function SettingsScreen({
  goals,
  onAddGoal,
  onEditGoal,
  onRemoveGoal,
}: SettingsScreenProps) {
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);

  const usedCategories = goals.map(g => g.category);

  const handleAdd = () => {
    setEditingGoal(undefined);
    setEditorVisible(true);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setEditorVisible(true);
  };

  const handleRemove = (goal: Goal) => {
    const config = ACTIVITY_CONFIGS[goal.category];
    Alert.alert('Remove Goal', `Remove ${config.label} goal?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => onRemoveGoal(goal.id),
      },
    ]);
  };

  const handleSave = (category: ActivityCategory, target: number) => {
    if (editingGoal) {
      onEditGoal(editingGoal.id, target);
    } else {
      onAddGoal(category, target);
    }
    setEditorVisible(false);
    setEditingGoal(undefined);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Your Weekly Goals</Text>

        {goals.map(goal => {
          const config = ACTIVITY_CONFIGS[goal.category];
          return (
            <TouchableOpacity
              key={goal.id}
              style={styles.goalRow}
              onPress={() => handleEdit(goal)}
              activeOpacity={0.7}>
              <View style={styles.goalInfo}>
                <Text style={styles.goalIcon}>{config.icon}</Text>
                <Text style={styles.goalLabel}>{config.label}</Text>
              </View>
              <View style={styles.goalActions}>
                <Text style={styles.goalTarget}>
                  {goal.target} {config.unit}
                </Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  onPress={() => handleRemove(goal)}>
                  <Text style={styles.removeText}>X</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}

        {usedCategories.length < 4 && (
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>+ Add New Goal</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <GoalEditor
        visible={editorVisible}
        existingGoal={editingGoal}
        usedCategories={usedCategories}
        onSave={handleSave}
        onCancel={() => {
          setEditorVisible(false);
          setEditingGoal(undefined);
        }}
      />
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
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 16,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  goalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  goalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalTarget: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 14,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.danger + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },
  addButton: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.primary,
  },
});
