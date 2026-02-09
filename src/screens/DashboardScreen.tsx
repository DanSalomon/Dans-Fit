import React, {useEffect} from 'react';
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
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 16,
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
