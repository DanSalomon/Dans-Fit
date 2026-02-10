import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import {addDays, format, isToday} from 'date-fns';
import {WeekPlan, ActivityCategory} from '../types';
import {getWeekBoundaries} from '../utils/weekUtils';
import {
  ACTIVITY_CONFIGS,
  ACTIVITY_CATEGORIES,
} from '../constants/exerciseTypes';
import {colors} from '../constants/colors';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface WeekPlanScreenProps {
  plan: WeekPlan;
  onToggleActivity: (dayIndex: number, category: ActivityCategory) => void;
}

export function WeekPlanScreen({plan, onToggleActivity}: WeekPlanScreenProps) {
  const [pickerDay, setPickerDay] = useState<number | null>(null);
  const {start} = getWeekBoundaries();

  const days = Array.from({length: 7}, (_, i) => {
    const date = addDays(start, i);
    return {
      index: i,
      name: DAY_NAMES[i],
      date,
      dateLabel: format(date, 'MMM d'),
      isToday: isToday(date),
      activities: plan.days[String(i)] || [],
    };
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {days.map(day => (
          <View
            key={day.index}
            style={[styles.dayCard, day.isToday && styles.dayCardToday]}>
            <View style={styles.dayHeader}>
              <View>
                <Text style={[styles.dayName, day.isToday && styles.dayNameToday]}>
                  {day.name}
                </Text>
                <Text style={styles.dayDate}>{day.dateLabel}</Text>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setPickerDay(day.index)}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chipRow}>
              {day.activities.length === 0 ? (
                <Text style={styles.restText}>Rest day</Text>
              ) : (
                day.activities.map(cat => {
                  const config = ACTIVITY_CONFIGS[cat];
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, {backgroundColor: config.color + '20'}]}
                      onPress={() => onToggleActivity(day.index, cat)}>
                      <Text style={styles.chipIcon}>{config.icon}</Text>
                      <Text style={[styles.chipLabel, {color: config.color}]}>
                        {config.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={pickerDay !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerDay(null)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setPickerDay(null)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Add Activity</Text>
            {ACTIVITY_CATEGORIES.map(cat => {
              const config = ACTIVITY_CONFIGS[cat];
              const alreadyAdded =
                pickerDay !== null &&
                (plan.days[String(pickerDay)] || []).includes(cat);
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.sheetOption,
                    alreadyAdded && styles.sheetOptionDisabled,
                  ]}
                  disabled={alreadyAdded}
                  onPress={() => {
                    if (pickerDay !== null) {
                      onToggleActivity(pickerDay, cat);
                      setPickerDay(null);
                    }
                  }}>
                  <Text style={styles.sheetIcon}>{config.icon}</Text>
                  <Text
                    style={[
                      styles.sheetLabel,
                      alreadyAdded && styles.sheetLabelDisabled,
                    ]}>
                    {config.label}
                  </Text>
                  {alreadyAdded && (
                    <Text style={styles.sheetCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
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
  dayCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  dayCardToday: {
    borderLeftColor: colors.primary,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  dayNameToday: {
    color: colors.primary,
  },
  dayDate: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginTop: -1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  restText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetOptionDisabled: {
    opacity: 0.4,
  },
  sheetIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  sheetLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  sheetLabelDisabled: {
    color: colors.textSecondary,
  },
  sheetCheck: {
    fontSize: 16,
    color: colors.success,
    fontWeight: '700',
  },
});
