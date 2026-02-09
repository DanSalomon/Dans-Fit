import {startOfWeek, addDays, setHours, addMinutes} from 'date-fns';
import type {SessionRecord} from './healthConnect';

function currentWeekDate(dayOffset: number, hour: number): Date {
  const weekStart = startOfWeek(new Date(), {weekStartsOn: 0});
  return setHours(addDays(weekStart, dayOffset), hour);
}

function isoString(date: Date): string {
  return date.toISOString();
}

interface MockSession extends SessionRecord {
  distanceKm?: number;
}

const MOCK_SESSIONS: MockSession[] = [
  // 3 runs: 5km, 8km, 5.5km
  {
    startTime: isoString(currentWeekDate(1, 7)),
    endTime: isoString(currentWeekDate(1, 8)),
    exerciseType: 56, // running
    distanceKm: 5.0,
  },
  {
    startTime: isoString(currentWeekDate(3, 6)),
    endTime: isoString(currentWeekDate(3, 7)),
    exerciseType: 56,
    distanceKm: 8.0,
  },
  {
    startTime: isoString(currentWeekDate(5, 7)),
    endTime: isoString(currentWeekDate(5, 8)),
    exerciseType: 57, // treadmill
    distanceKm: 5.5,
  },
  // 2 bike rides: 15km, 17km
  {
    startTime: isoString(currentWeekDate(2, 17)),
    endTime: isoString(currentWeekDate(2, 18)),
    exerciseType: 8, // biking
    distanceKm: 15.0,
  },
  {
    startTime: isoString(currentWeekDate(4, 17)),
    endTime: isoString(currentWeekDate(4, 19)),
    exerciseType: 8,
    distanceKm: 17.0,
  },
  // 1 swim: 1.2km
  {
    startTime: isoString(currentWeekDate(3, 12)),
    endTime: isoString(currentWeekDate(3, 13)),
    exerciseType: 74, // pool swimming
    distanceKm: 1.2,
  },
  // 2 gym sessions: 1hr, 0.5hr
  {
    startTime: isoString(currentWeekDate(1, 18)),
    endTime: isoString(currentWeekDate(1, 19)),
    exerciseType: 70, // strength training
  },
  {
    startTime: isoString(currentWeekDate(4, 7)),
    endTime: isoString(addMinutes(currentWeekDate(4, 7), 30)),
    exerciseType: 81, // weightlifting
  },
];

export async function initializeHealthConnect(): Promise<boolean> {
  return true;
}

export async function checkAvailability(): Promise<boolean> {
  return true;
}

export async function requestHealthPermissions(): Promise<boolean> {
  return true;
}

export async function readExerciseSessions(
  _startTime: string,
  _endTime: string,
): Promise<SessionRecord[]> {
  // Simulate network delay
  await new Promise<void>(resolve => setTimeout(resolve, 300));
  return MOCK_SESSIONS.map(({distanceKm: _, ...session}) => session);
}

export async function readDistanceForTimeRange(
  startTime: string,
  endTime: string,
): Promise<number> {
  await new Promise<void>(resolve => setTimeout(resolve, 100));
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  let totalKm = 0;
  for (const session of MOCK_SESSIONS) {
    if (!session.distanceKm) {
      continue;
    }
    const sessionStart = new Date(session.startTime).getTime();
    const sessionEnd = new Date(session.endTime).getTime();
    // Check if session overlaps with the requested time range
    if (sessionStart >= start && sessionEnd <= end) {
      totalKm += session.distanceKm;
    }
  }
  return totalKm;
}
