import {useState, useCallback} from 'react';
import {Goal, HistoryWeekData} from '../types';
import {getPastWeekBoundaries, getWeekKey, formatWeekRange} from '../utils/weekUtils';
import {computeProgressForSessions} from '../utils/computeProgress';
import {
  getCachedWeek,
  setCachedWeek,
  clearHistoryCache,
} from '../storage/historyCacheStorage';

const USE_MOCK = false;

const hc = USE_MOCK
  ? require('../services/mockHealthConnect')
  : require('../services/healthConnect');

const INITIAL_WEEKS = 8;
const LOAD_MORE_COUNT = 4;

async function fetchWeekData(
  weeksAgo: number,
  goals: Goal[],
): Promise<HistoryWeekData> {
  const {start, end} = getPastWeekBoundaries(weeksAgo);
  const weekKey = getWeekKey(start);

  const sessions = await hc.readExerciseSessions(
    start.toISOString(),
    end.toISOString(),
  );
  const progress = await computeProgressForSessions(goals, sessions, hc);

  const overallPercent =
    progress.length > 0
      ? Math.round(
          (progress.reduce((sum, p) => {
            const ratio = p.target > 0 ? Math.min(p.current / p.target, 1) : 0;
            return sum + ratio;
          }, 0) /
            progress.length) *
            100,
        )
      : 0;

  return {
    weekKey,
    dateRange: formatWeekRange(start),
    startDate: start.toISOString(),
    progress,
    overallPercent,
  };
}

export function useHistoricalProgress(goals: Goal[]) {
  const [weeks, setWeeks] = useState<HistoryWeekData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);

  const fetchWeeks = useCallback(
    async (startWeeksAgo: number, count: number): Promise<HistoryWeekData[]> => {
      const results: HistoryWeekData[] = [];

      for (let i = startWeeksAgo; i < startWeeksAgo + count; i++) {
        const {start} = getPastWeekBoundaries(i);
        const weekKey = getWeekKey(start);

        const cached = await getCachedWeek(weekKey, goals);
        if (cached) {
          results.push(cached);
        } else {
          const weekData = await fetchWeekData(i, goals);
          await setCachedWeek(weekData, goals);
          results.push(weekData);
        }
      }

      return results;
    },
    [goals],
  );

  const loadInitial = useCallback(async () => {
    if (goals.length === 0) {
      setWeeks([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const initialized = await hc.initializeHealthConnect();
      if (!initialized) {
        setError('Health Connect is not available');
        setLoading(false);
        return;
      }

      const granted = await hc.requestHealthPermissions();
      if (!granted) {
        setError('Health Connect permissions not granted');
        setLoading(false);
        return;
      }

      const data = await fetchWeeks(1, INITIAL_WEEKS);
      setWeeks(data);
      setLoadedCount(INITIAL_WEEKS);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [goals, fetchWeeks]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading) {
      return;
    }

    setLoadingMore(true);
    try {
      const startFrom = loadedCount + 1;
      const data = await fetchWeeks(startFrom, LOAD_MORE_COUNT);
      setWeeks(prev => [...prev, ...data]);
      setLoadedCount(prev => prev + LOAD_MORE_COUNT);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load more weeks');
    } finally {
      setLoadingMore(false);
    }
  }, [loadedCount, loadingMore, loading, fetchWeeks]);

  const refresh = useCallback(async () => {
    await clearHistoryCache();
    await loadInitial();
  }, [loadInitial]);

  return {weeks, loading, loadingMore, error, loadInitial, loadMore, refresh};
}
