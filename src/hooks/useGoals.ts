import {useState, useEffect, useCallback} from 'react';
import {Goal, ActivityCategory} from '../types';
import {loadGoals, saveGoals} from '../storage/goalsStorage';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals()
      .then(setGoals)
      .finally(() => setLoading(false));
  }, []);

  const addGoal = useCallback(
    async (category: ActivityCategory, target: number) => {
      const newGoal: Goal = {
        id: Date.now().toString(),
        category,
        target,
      };
      const updated = [...goals, newGoal];
      setGoals(updated);
      await saveGoals(updated);
    },
    [goals],
  );

  const editGoal = useCallback(
    async (id: string, target: number) => {
      const updated = goals.map(g => (g.id === id ? {...g, target} : g));
      setGoals(updated);
      await saveGoals(updated);
    },
    [goals],
  );

  const removeGoal = useCallback(
    async (id: string) => {
      const updated = goals.filter(g => g.id !== id);
      setGoals(updated);
      await saveGoals(updated);
    },
    [goals],
  );

  return {goals, loading, addGoal, editGoal, removeGoal};
}
