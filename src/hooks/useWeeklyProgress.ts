import {useState, useCallback} from 'react';
import {Goal, WeeklyProgress, ActivityDetail} from '../types';
import {ACTIVITY_CONFIGS} from '../constants/exerciseTypes';
import {getWeekBoundaries} from '../utils/weekUtils';

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

      const results: WeeklyProgress[] = [];

      for (const goal of goals) {
        const config = ACTIVITY_CONFIGS[goal.category];
        const matchingSessions = sessions.filter(
          (s: {exerciseType: number}) =>
            config.exerciseTypes.includes(s.exerciseType),
        );

        let current = 0;
        const activities: ActivityDetail[] = [];

        if (config.unit === 'km') {
          for (const session of matchingSessions) {
            const km = await hc.readDistanceForTimeRange(
              session.startTime,
              session.endTime,
            );
            current += km;
            activities.push({
              date: session.startTime,
              startTime: session.startTime,
              endTime: session.endTime,
              value: Math.round(km * 10) / 10,
            });
          }
        } else {
          for (const session of matchingSessions) {
            const startMs = new Date(session.startTime).getTime();
            const endMs = new Date(session.endTime).getTime();
            const hours = (endMs - startMs) / (1000 * 60 * 60);
            current += hours;
            activities.push({
              date: session.startTime,
              startTime: session.startTime,
              endTime: session.endTime,
              value: Math.round(hours * 10) / 10,
            });
          }
        }

        activities.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

        results.push({
          goalId: goal.id,
          category: goal.category,
          current: Math.round(current * 10) / 10,
          target: goal.target,
          unit: config.unit,
          activities,
        });
      }

      setProgress(results);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  }, [goals]);

  return {progress, loading, error, permissionsGranted, fetchProgress};
}
