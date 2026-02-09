import AsyncStorage from '@react-native-async-storage/async-storage';
import {Goal} from '../types';

const GOALS_KEY = '@dansfit_goals';

export async function loadGoals(): Promise<Goal[]> {
  const json = await AsyncStorage.getItem(GOALS_KEY);
  if (!json) {
    return [];
  }
  return JSON.parse(json) as Goal[];
}

export async function saveGoals(goals: Goal[]): Promise<void> {
  await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}
