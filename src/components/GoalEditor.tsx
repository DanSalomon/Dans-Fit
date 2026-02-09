import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import {ActivityCategory, Goal} from '../types';
import {
  ACTIVITY_CONFIGS,
  ACTIVITY_CATEGORIES,
} from '../constants/exerciseTypes';
import {colors} from '../constants/colors';

interface GoalEditorProps {
  visible: boolean;
  existingGoal?: Goal;
  usedCategories: ActivityCategory[];
  onSave: (category: ActivityCategory, target: number) => void;
  onCancel: () => void;
}

export function GoalEditor({
  visible,
  existingGoal,
  usedCategories,
  onSave,
  onCancel,
}: GoalEditorProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<ActivityCategory | null>(existingGoal?.category ?? null);
  const [targetValue, setTargetValue] = useState(
    existingGoal?.target.toString() ?? '',
  );

  const availableCategories = ACTIVITY_CATEGORIES.filter(
    cat =>
      cat === existingGoal?.category || !usedCategories.includes(cat),
  );

  const selectedConfig = selectedCategory
    ? ACTIVITY_CONFIGS[selectedCategory]
    : null;

  const handleSave = () => {
    if (!selectedCategory || !targetValue) {
      return;
    }
    const target = parseFloat(targetValue);
    if (isNaN(target) || target <= 0) {
      return;
    }
    onSave(selectedCategory, target);
  };

  const handleCancel = () => {
    setSelectedCategory(existingGoal?.category ?? null);
    setTargetValue(existingGoal?.target.toString() ?? '');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>
            {existingGoal ? 'Edit Goal' : 'Add Goal'}
          </Text>

          <Text style={styles.sectionLabel}>Activity Type</Text>
          <View style={styles.categoryList}>
            {availableCategories.map(cat => {
              const config = ACTIVITY_CONFIGS[cat];
              const isSelected = selectedCategory === cat;
              const isDisabled = !!existingGoal && cat !== existingGoal.category;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    isSelected && {borderColor: config.color, backgroundColor: config.color + '15'},
                    isDisabled && styles.categoryDisabled,
                  ]}
                  disabled={isDisabled}
                  onPress={() => setSelectedCategory(cat)}>
                  <Text style={styles.categoryIcon}>{config.icon}</Text>
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && {color: config.color},
                    ]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Target</Text>
          <View style={styles.targetRow}>
            <TextInput
              style={styles.targetInput}
              value={targetValue}
              onChangeText={setTargetValue}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={styles.unitLabel}>
              {selectedConfig?.unit ?? '—'}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!selectedCategory || !targetValue) && styles.saveButtonDisabled,
            ]}
            disabled={!selectedCategory || !targetValue}
            onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Goal</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  categoryDisabled: {
    opacity: 0.4,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  targetInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 18,
    color: colors.text,
    marginRight: 12,
  },
  unitLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 32,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
