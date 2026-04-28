import {useState, useEffect, useCallback} from 'react';
import {GymSession} from '../types';
import {loadSessions, appendSession as appendSessionStorage} from '../storage/gymStorage';

export function useGymSessions() {
  const [sessions, setSessions] = useState<GymSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions()
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  const appendSession = useCallback(async (session: GymSession) => {
    const updated = await appendSessionStorage(session);
    setSessions(updated);
  }, []);

  return {sessions, loading, appendSession};
}
