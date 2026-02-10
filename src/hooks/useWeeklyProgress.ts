import {useState, useCallback} from 'react';
import {Goal, WeeklyProgress} from '../types';
import {getWeekBoundaries} from '../utils/weekUtils';
import {computeProgressForSessions} from '../utils/computeProgress';

const USE_MOCK = false;

const hc = USE_MOCK
  ? require('../services/mockHealthConnect')
  : require('../services/healthConnect');

export function useWeeklyProgress(goals: Goal[]) {
  const [progress, setProgress] = useState<WeeklyProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState<boolean | null>(
    null,
  );

  const fetchProgress = useCallback(async () => {
    if (goals.length === 0) {
      setProgress([]);
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
      setPermissionsGranted(granted);
      if (!granted) {
        setError('Health Connect permissions not granted');
        setLoading(false);
        return;
      }

      const {start, end} = getWeekBoundaries();
      const startTime = start.toISOString();
      const endTime = end.toISOString();

      const sessions = await hc.readExerciseSessions(startTime, endTime);

      const results = await computeProgressForSessions(goals, sessions, hc);

      setProgress(results);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  }, [goals]);

  return {progress, loading, error, permissionsGranted, fetchProgress};
}
