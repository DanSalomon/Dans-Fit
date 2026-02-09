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
import {ProgressBar} from '../components/ProgressBar';
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
        <View style={styles.overallHeader}>
          <Text style={styles.overallLabel}>Weekly Progress</Text>
          <Text style={styles.overallPercent}>
            {Math.round(overallProgress * 100)}%
          </Text>
        </View>
        <ProgressBar progress={overallProgress} color={colors.primary} />
        <Text style={styles.overallSub}>
          {progress.filter(p => p.current >= p.target).length} of{' '}
          {progress.length} goals completed
        </Text>
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  overallLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  overallPercent: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  overallSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
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
