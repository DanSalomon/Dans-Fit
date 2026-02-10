import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {HistoryWeekData} from '../types';
import {DonutChart} from './DonutChart';
import {ProgressCard} from './ProgressCard';
import {colors} from '../constants/colors';

interface HistoryWeekCardProps {
  week: HistoryWeekData;
}

export function HistoryWeekCard({week}: HistoryWeekCardProps) {
  const [expanded, setExpanded] = useState(false);
  const overallFraction = week.overallPercent / 100;
  const goalsCompleted = week.progress.filter(
    p => p.current >= p.target,
  ).length;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)}>
        <DonutChart
          size={44}
          strokeWidth={5}
          progress={overallFraction}
          color={week.overallPercent >= 100 ? colors.success : colors.primary}>
          <Text style={styles.donutText}>{week.overallPercent}%</Text>
        </DonutChart>
        <View style={styles.headerText}>
          <Text style={styles.dateRange}>{week.dateRange}</Text>
          <Text style={styles.summary}>
            {goalsCompleted}/{week.progress.length} goals completed
          </Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expanded}>
          {week.progress.map(p => (
            <ProgressCard key={p.goalId} progress={p} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerText: {
    flex: 1,
    marginLeft: 14,
  },
  dateRange: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  summary: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 10,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  donutText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  expanded: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
});
