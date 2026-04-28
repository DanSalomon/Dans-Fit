import {useState, useCallback, useEffect, useMemo} from 'react';
import {Goal, GymSession, HistoryWeekData} from '../types';
import {
  getPastWeekBoundaries,
  getWeekBoundaries,
  getWeekKey,
  formatWeekRange,
} from '../utils/weekUtils';
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

export function useHistoricalProgress(goals: Goal[], gymSessions: GymSession[] = []) {
  const [weeks, setWeeks] = useState<HistoryWeekData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);

  const sessionsByWeek = useMemo(() => {
    const map: Record<string, GymSession[]> = {};
    for (const s of gymSessions) {
      const key = getWeekKey(new Date(s.startTime));
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(s);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => b.startTime.localeCompare(a.startTime));
    }
    return map;
  }, [gymSessions]);

  const attachSessions = useCallback(
    (data: HistoryWeekData[]): HistoryWeekData[] =>
      data.map(w => ({...w, gymSessions: sessionsByWeek[w.weekKey] ?? []})),
    [sessionsByWeek],
  );

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
      setWeeks(attachSessions(data));
      setLoadedCount(INITIAL_WEEKS);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [goals, fetchWeeks, attachSessions]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading) {
      return;
    }

    setLoadingMore(true);
    try {
      const startFrom = loadedCount + 1;
      const data = await fetchWeeks(startFrom, LOAD_MORE_COUNT);
      setWeeks(prev => [...prev, ...attachSessions(data)]);
      setLoadedCount(prev => prev + LOAD_MORE_COUNT);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load more weeks');
    } finally {
      setLoadingMore(false);
    }
  }, [loadedCount, loadingMore, loading, fetchWeeks, attachSessions]);

  const refresh = useCallback(async () => {
    await clearHistoryCache();
    await loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    setWeeks(prev => {
      const currentWeekKey = getWeekKey(new Date());
      const currentSessions = sessionsByWeek[currentWeekKey] ?? [];

      const updated = prev.map(w => ({
        ...w,
        gymSessions: sessionsByWeek[w.weekKey] ?? [],
      }));

      const headIsCurrent = updated[0]?.weekKey === currentWeekKey;

      if (currentSessions.length > 0 && !headIsCurrent) {
        const {start} = getWeekBoundaries(new Date());
        const synthetic: HistoryWeekData = {
          weekKey: currentWeekKey,
          dateRange: `${formatWeekRange(new Date())} (this week)`,
          startDate: start.toISOString(),
          progress: [],
          overallPercent: 0,
          gymSessions: currentSessions,
        };
        return [synthetic, ...updated];
      }

      if (currentSessions.length === 0 && headIsCurrent && updated[0].progress.length === 0) {
        return updated.slice(1);
      }

      return updated;
    });
  }, [sessionsByWeek]);

  return {weeks, loading, loadingMore, error, loadInitial, loadMore, refresh};
}
