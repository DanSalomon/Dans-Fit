import {useState, useEffect, useCallback} from 'react';
import {WeekPlan, ActivityCategory} from '../types';
import {getWeekKey} from '../utils/weekUtils';
import {loadWeekPlan, saveWeekPlan} from '../storage/weekPlanStorage';

function createEmptyPlan(weekKey: string): WeekPlan {
  const days: Record<string, ActivityCategory[]> = {};
  for (let i = 0; i < 7; i++) {
    days[String(i)] = [];
  }
  return {weekKey, days};
}

export function useWeekPlan() {
  const [plan, setPlan] = useState<WeekPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const weekKey = getWeekKey(new Date());

  useEffect(() => {
    loadWeekPlan(weekKey)
      .then(stored => {
        setPlan(stored ?? createEmptyPlan(weekKey));
      })
      .finally(() => setLoading(false));
  }, [weekKey]);

  const toggleActivity = useCallback(
    async (dayIndex: number, category: ActivityCategory) => {
      setPlan(prev => {
        if (!prev) {
          return prev;
        }
        const key = String(dayIndex);
        const current = prev.days[key] || [];
        const exists = current.includes(category);
        const updated: WeekPlan = {
          ...prev,
          days: {
            ...prev.days,
            [key]: exists
              ? current.filter(c => c !== category)
              : [...current, category],
          },
        };
        saveWeekPlan(updated);
        return updated;
      });
    },
    [],
  );

  return {plan, loading, toggleActivity};
}
