import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {format} from 'date-fns';
import {WeeklyProgress} from '../types';
import {ACTIVITY_CONFIGS} from '../constants/exerciseTypes';
import {ProgressBar} from './ProgressBar';
import {colors} from '../constants/colors';

interface ProgressCardProps {
  progress: WeeklyProgress;
}

export function ProgressCard({progress}: ProgressCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = ACTIVITY_CONFIGS[progress.category];
  const percentage = progress.target > 0 ? progress.current / progress.target : 0;
  const percentDisplay = Math.round(percentage * 100);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => setExpanded(!expanded)}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>{config.icon}</Text>
          <Text style={styles.label}>{config.label}</Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </View>
      <ProgressBar progress={percentage} color={config.color} />
      <View style={styles.footer}>
        <Text style={styles.values}>
          {progress.current} / {progress.target} {progress.unit}
        </Text>
        <Text
          style={[
            styles.percent,
            percentDisplay >= 100 && styles.percentComplete,
          ]}>
          {percentDisplay}%
        </Text>
      </View>

      {expanded && (
        <View style={styles.activitiesList}>
          {progress.activities.length === 0 ? (
            <Text style={styles.noActivities}>No activities this week</Text>
          ) : (
            <>
              <View style={styles.listHeader}>
                <Text style={[styles.colHeader, styles.colDate]}>Date</Text>
                <Text style={[styles.colHeader, styles.colTime]}>Time</Text>
                <Text style={[styles.colHeader, styles.colValue]}>
                  {config.unit === 'km' ? 'Distance' : 'Duration'}
                </Text>
              </View>
              {progress.activities.map((activity, idx) => {
                const startDate = new Date(activity.startTime);
                const endDate = new Date(activity.endTime);
                return (
                  <View
                    key={idx}
                    style={[
                      styles.activityRow,
                      idx % 2 === 0 && styles.activityRowAlt,
                    ]}>
                    <Text style={[styles.colCell, styles.colDate]}>
                      {format(startDate, 'EEE, MMM d')}
                    </Text>
                    <Text style={[styles.colCell, styles.colTime]}>
                      {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                    </Text>
                    <Text style={[styles.colCell, styles.colValue]}>
                      {activity.value} {config.unit}
                    </Text>
                  </View>
                );
              })}
            </>
          )}
        </View>
      )}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  chevron: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  values: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  percent: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  percentComplete: {
    color: colors.success,
  },
  activitiesList: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  noActivities: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 8,
  },
  listHeader: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  colHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  activityRow: {
    flexDirection: 'row',
    paddingVertical: 7,
  },
  activityRowAlt: {
    backgroundColor: colors.background,
    borderRadius: 6,
    marginHorizontal: -4,
    paddingHorizontal: 4,
  },
  colCell: {
    fontSize: 13,
    color: colors.text,
  },
  colDate: {
    flex: 3,
  },
  colTime: {
    flex: 3,
  },
  colValue: {
    flex: 2,
    textAlign: 'right',
  },
});
