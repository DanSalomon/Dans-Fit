import {useState, useEffect, useCallback} from 'react';
import {GymWorkout} from '../types';
import {loadWorkouts, saveWorkouts} from '../storage/gymStorage';

export function useGymWorkouts() {
  const [workouts, setWorkouts] = useState<GymWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkouts()
      .then(setWorkouts)
      .finally(() => setLoading(false));
  }, []);

  const addWorkout = useCallback(
    async (workout: GymWorkout) => {
      const updated = [...workouts, workout];
      setWorkouts(updated);
      await saveWorkouts(updated);
    },
    [workouts],
  );

  const updateWorkout = useCallback(
    async (workout: GymWorkout) => {
      const updated = workouts.map(w => (w.id === workout.id ? workout : w));
      setWorkouts(updated);
      await saveWorkouts(updated);
    },
    [workouts],
  );

  const removeWorkout = useCallback(
    async (id: string) => {
      const updated = workouts.filter(w => w.id !== id);
      setWorkouts(updated);
      await saveWorkouts(updated);
    },
    [workouts],
  );

  return {workouts, loading, addWorkout, updateWorkout, removeWorkout};
}
