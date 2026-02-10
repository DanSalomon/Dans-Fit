import {Goal, WeeklyProgress, ActivityDetail} from '../types';
import {ACTIVITY_CONFIGS} from '../constants/exerciseTypes';

interface SessionRecord {
  startTime: string;
  endTime: string;
  exerciseType: number;
}

interface HealthConnectReader {
  readDistanceForTimeRange: (
    startTime: string,
    endTime: string,
  ) => Promise<number>;
}

export async function computeProgressForSessions(
  goals: Goal[],
  sessions: SessionRecord[],
  hcReader: HealthConnectReader,
): Promise<WeeklyProgress[]> {
  const results: WeeklyProgress[] = [];

  for (const goal of goals) {
    const config = ACTIVITY_CONFIGS[goal.category];
    const matchingSessions = sessions.filter(s =>
      config.exerciseTypes.includes(s.exerciseType),
    );

    let current = 0;
    const activities: ActivityDetail[] = [];

    if (config.unit === 'km') {
      for (const session of matchingSessions) {
        const km = await hcReader.readDistanceForTimeRange(
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

  return results;
}
