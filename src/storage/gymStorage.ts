import AsyncStorage from '@react-native-async-storage/async-storage';
import {GymWorkout, GymSession} from '../types';

const WORKOUTS_KEY = '@dansfit_gym_workouts';
const SESSIONS_KEY = '@dansfit_gym_sessions';

export async function loadWorkouts(): Promise<GymWorkout[]> {
  const json = await AsyncStorage.getItem(WORKOUTS_KEY);
  if (!json) {
    return [];
  }
  return JSON.parse(json) as GymWorkout[];
}

export async function saveWorkouts(workouts: GymWorkout[]): Promise<void> {
  await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
}

export async function loadSessions(): Promise<GymSession[]> {
  const json = await AsyncStorage.getItem(SESSIONS_KEY);
  if (!json) {
    return [];
  }
  return JSON.parse(json) as GymSession[];
}

export async function appendSession(session: GymSession): Promise<GymSession[]> {
  const existing = await loadSessions();
  const updated = [...existing, session];
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
  return updated;
}
