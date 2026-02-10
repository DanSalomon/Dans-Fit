import AsyncStorage from '@react-native-async-storage/async-storage';
import {WeekPlan} from '../types';

const WEEK_PLAN_KEY = '@dansfit_weekplan';

export async function loadWeekPlan(
  weekKey: string,
): Promise<WeekPlan | null> {
  const json = await AsyncStorage.getItem(WEEK_PLAN_KEY);
  if (!json) {
    return null;
  }
  const plan = JSON.parse(json) as WeekPlan;
  if (plan.weekKey !== weekKey) {
    return null;
  }
  return plan;
}

export async function saveWeekPlan(plan: WeekPlan): Promise<void> {
  await AsyncStorage.setItem(WEEK_PLAN_KEY, JSON.stringify(plan));
}
