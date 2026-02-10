import AsyncStorage from '@react-native-async-storage/async-storage';
import {Goal, HistoryWeekData} from '../types';

const CACHE_PREFIX = '@dansfit_history_';
const GOALS_HASH_KEY = '@dansfit_history_goals_hash';

function computeGoalsHash(goals: Goal[]): string {
  const sorted = [...goals].sort((a, b) => a.id.localeCompare(b.id));
  return sorted.map(g => `${g.id}:${g.category}:${g.target}`).join('|');
}

async function isGoalsHashValid(goals: Goal[]): Promise<boolean> {
  const stored = await AsyncStorage.getItem(GOALS_HASH_KEY);
  return stored === computeGoalsHash(goals);
}

async function saveGoalsHash(goals: Goal[]): Promise<void> {
  await AsyncStorage.setItem(GOALS_HASH_KEY, computeGoalsHash(goals));
}

export async function getCachedWeek(
  weekKey: string,
  goals: Goal[],
): Promise<HistoryWeekData | null> {
  const valid = await isGoalsHashValid(goals);
  if (!valid) {
    return null;
  }
  const json = await AsyncStorage.getItem(CACHE_PREFIX + weekKey);
  if (!json) {
    return null;
  }
  return JSON.parse(json) as HistoryWeekData;
}

export async function setCachedWeek(
  weekData: HistoryWeekData,
  goals: Goal[],
): Promise<void> {
  await saveGoalsHash(goals);
  await AsyncStorage.setItem(
    CACHE_PREFIX + weekData.weekKey,
    JSON.stringify(weekData),
  );
}

export async function clearHistoryCache(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const historyKeys = keys.filter(
    k => k.startsWith(CACHE_PREFIX) || k === GOALS_HASH_KEY,
  );
  if (historyKeys.length > 0) {
    await AsyncStorage.multiRemove(historyKeys);
  }
}
