import React, {useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {Goal, HistoryWeekData} from '../types';
import {useHistoricalProgress} from '../hooks/useHistoricalProgress';
import {HistoryWeekCard} from '../components/HistoryWeekCard';
import {colors} from '../constants/colors';

interface HistoryScreenProps {
  goals: Goal[];
}

export function HistoryScreen({goals}: HistoryScreenProps) {
  const {weeks, loading, loadingMore, error, loadInitial, loadMore, refresh} =
    useHistoricalProgress(goals);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const renderItem = ({item}: {item: HistoryWeekData}) => (
    <HistoryWeekCard week={item} />
  );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }

    if (weeks.length > 0) {
      return (
        <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
          <Text style={styles.loadMoreText}>Load Earlier Weeks</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderEmpty = () => {
    if (loading) {
      return null;
    }

    if (goals.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Goals Set</Text>
          <Text style={styles.emptySubtitle}>
            Add goals in Settings to see your history
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={styles.emptyTitle}>No History Yet</Text>
        <Text style={styles.emptySubtitle}>
          Past weeks will appear here once you start tracking
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      <FlatList
        data={weeks}
        keyExtractor={item => item.weekKey}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.content,
          weeks.length === 0 && styles.contentEmpty,
        ]}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
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
  contentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  errorBanner: {
    backgroundColor: colors.danger + '15',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
  },
  footerLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadMoreButton: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadMoreText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
