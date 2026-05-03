import {
  initialize,
  requestPermission,
  getGrantedPermissions,
  readRecords,
  insertRecords,
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
    const existing = await getGrantedPermissions();
    const hasReadExercise = existing.some(
      (p: any) => p.recordType === 'ExerciseSession' && p.accessType === 'read',
    );
    const hasReadDistance = existing.some(
      (p: any) => p.recordType === 'Distance' && p.accessType === 'read',
    );
    if (hasReadExercise && hasReadDistance) {
      return true;
    }

    const granted = await requestPermission([
      {accessType: 'read', recordType: 'ExerciseSession'},
      {accessType: 'read', recordType: 'Distance'},
    ]);
    return granted.length >= 1;
  } catch {
    return false;
  }
}

export async function requestExerciseWritePermission(): Promise<boolean> {
  try {
    const existing = await getGrantedPermissions();
    const hasWrite = existing.some(
      (p: any) => p.recordType === 'ExerciseSession' && p.accessType === 'write',
    );
    if (hasWrite) {
      return true;
    }
    const granted = await requestPermission([
      {accessType: 'write', recordType: 'ExerciseSession'},
    ]);
    return granted.some(
      (p: any) => p.recordType === 'ExerciseSession' && p.accessType === 'write',
    );
  } catch {
    return false;
  }
}

export async function writeStrengthSession(params: {
  startTime: string;
  endTime: string;
  title: string;
  notes?: string;
}): Promise<string | null> {
  try {
    const ok = await requestExerciseWritePermission();
    if (!ok) {
      return null;
    }
    const ids = await insertRecords([
      {
        recordType: 'ExerciseSession',
        startTime: params.startTime,
        endTime: params.endTime,
        exerciseType: 70, // Strength training
        title: params.title,
        notes: params.notes,
      },
    ]);
    return ids[0] ?? null;
  } catch {
    return null;
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
