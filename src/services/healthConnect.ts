import {
  initialize,
  requestPermission,
  getGrantedPermissions,
  readRecords,
  getSdkStatus,
} from 'react-native-health-connect';

export async function initializeHealthConnect(): Promise<boolean> {
  try {
    return await initialize();
  } catch {
    return false;
  }
}

export async function checkAvailability(): Promise<boolean> {
  try {
    const status = await getSdkStatus();
    return status === 3; // SDK_AVAILABLE
  } catch {
    return false;
  }
}

export async function requestHealthPermissions(): Promise<boolean> {
  try {
    // Check if permissions are already granted
    const existing = await getGrantedPermissions();
    const hasExercise = existing.some(
      (p: any) => p.recordType === 'ExerciseSession',
    );
    const hasDistance = existing.some(
      (p: any) => p.recordType === 'Distance',
    );
    if (hasExercise && hasDistance) {
      return true;
    }

    // Request permissions that are missing
    const granted = await requestPermission([
      {accessType: 'read', recordType: 'ExerciseSession'},
      {accessType: 'read', recordType: 'Distance'},
    ]);
    return granted.length >= 1;
  } catch {
    return false;
  }
}

export interface SessionRecord {
  startTime: string;
  endTime: string;
  exerciseType: number;
}

export interface DistRecord {
  distance: {
    inKilometers: number;
  };
}

export async function readExerciseSessions(
  startTime: string,
  endTime: string,
): Promise<SessionRecord[]> {
  const result = await readRecords('ExerciseSession', {
    timeRangeFilter: {
      operator: 'between',
      startTime,
      endTime,
    },
  });
  return result.records.map(r => ({
    startTime: r.startTime,
    endTime: r.endTime,
    exerciseType: r.exerciseType,
  }));
}

export async function readDistanceForTimeRange(
  startTime: string,
  endTime: string,
): Promise<number> {
  const result = await readRecords('Distance', {
    timeRangeFilter: {
      operator: 'between',
      startTime,
      endTime,
    },
  });
  let totalKm = 0;
  for (const record of result.records) {
    totalKm += (record.distance as any).inKilometers ?? 0;
  }
  return totalKm;
}
