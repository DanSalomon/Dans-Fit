import React, {useEffect, useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Goal} from '../types';
import {useWeeklyProgress} from '../hooks/useWeeklyProgress';
import {formatWeekRange} from '../utils/weekUtils';
import {ProgressCard} from '../components/ProgressCard';
import {DonutChart} from '../components/DonutChart';
import {EmptyState} from '../components/EmptyState';
import {colors} from '../constants/colors';

interface DashboardScreenProps {
  goals: Goal[];
}

export function DashboardScreen({goals}: DashboardScreenProps) {
  const navigation = useNavigation();
  const {progress, loading, error, fetchProgress} = useWeeklyProgress(goals);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const overallProgress = useMemo(() => {
    if (progress.length === 0) {
      return 0;
    }
    const total = progress.reduce((sum, p) => {
      const ratio = p.target > 0 ? Math.min(p.current / p.target, 1) : 0;
      return sum + ratio;
    }, 0);
    return total / progress.length;
  }, [progress]);

  if (goals.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          onGoToSettings={() =>
            (navigation as any).navigate('Settings')
          }
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchProgress} />
      }>
      <Text style={styles.weekRange}>{formatWeekRange()}</Text>

      <View style={styles.overallCard}>
        <Text style={styles.overallTitle}>Weekly Progress</Text>
        <View style={styles.donutRow}>
          <DonutChart
            size={140}
            strokeWidth={14}
            progress={overallProgress}
            color={colors.primary}>
            <Text style={styles.donutPercent}>
              {Math.round(overallProgress * 100)}%
            </Text>
          </DonutChart>
          <View style={styles.overallStats}>
            <Text style={styles.statNumber}>
              {progress.filter(p => p.current >= p.target).length}
            </Text>
            <Text style={styles.statLabel}>of {progress.length} goals{'\n'}completed</Text>
          </View>
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {progress.map(p => (
        <ProgressCard key={p.goalId} progress={p} />
      ))}
    </ScrollView>
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
  weekRange: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  overallCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  overallTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  donutPercent: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  overallStats: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorBanner: {
    backgroundColor: colors.danger + '15',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
  },
});
